import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import multer from "multer";
import { Readable } from "stream";
import axios from "axios";
import qs from "qs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  
  // CORS Configuration for Android and Web
  app.use(cors({
    origin: (origin, callback) => {
      // Allow all origins for now to fix Android issues, or specify your app's origins
      // Common Capacitor origins: http://localhost, capacitor://localhost
      callback(null, true);
    },
    credentials: true
  }));

  // Google OAuth Configuration
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.APP_URL ? `${process.env.APP_URL}/auth/google/callback` : undefined
  );

  // Helper to get redirect URI dynamically
  const getGoogleRedirectUri = (req: express.Request) => {
    // For Google OAuth, we MUST use the deployed URL as the redirect URI
    // because the callback handler is on the server.
    const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    return `${baseUrl}/auth/google/callback`;
  };

  // Microsoft OAuth Configuration
  const MS_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
  const MS_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;

  if (!MS_CLIENT_ID || !MS_CLIENT_SECRET) {
    console.warn("Microsoft OneDrive credentials are missing. OneDrive integration will not work.");
  }

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Google Auth URL
  app.get("/api/auth/google/drive/url", (req, res) => {
    const dynamicRedirectUri = getGoogleRedirectUri(req);
    console.log("Generating Google Auth URL with redirect_uri:", dynamicRedirectUri);
    
    const scopes = [
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.file'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      redirect_uri: dynamicRedirectUri
    });

    res.json({ url });
  });

  // Google Auth Callback
  app.get("/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    const dynamicRedirectUri = getGoogleRedirectUri(req);
    console.log("Handling Google Auth Callback with redirect_uri:", dynamicRedirectUri);

    try {
      const { tokens } = await oauth2Client.getToken({
        code: code as string,
        redirect_uri: dynamicRedirectUri
      });
      
      console.log("Successfully obtained Google Drive tokens");
      // Store tokens in a secure cookie
      res.cookie('google_drive_tokens', JSON.stringify(tokens), {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GOOGLE_DRIVE_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>تم ربط الحساب بنجاح. سيتم إغلاق هذه النافذة تلقائياً.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error('Error exchanging code for tokens:', error.response?.data || error.message);
      res.status(500).send(`Authentication failed: ${error.message}`);
    }
  });

  // Fetch Google Drive Files
  app.get("/api/google/drive/files", async (req, res) => {
    const tokensCookie = req.cookies.google_drive_tokens;
    if (!tokensCookie) {
      return res.status(401).json({ error: 'Google Drive not connected' });
    }

    try {
      const tokens = JSON.parse(tokensCookie);
      oauth2Client.setCredentials(tokens);

      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      const response = await drive.files.list({
        pageSize: 20,
        fields: 'nextPageToken, files(id, name, mimeType, webViewLink, iconLink)',
        q: "trashed = false and (mimeType = 'application/pdf' or mimeType contains 'video/' or mimeType contains 'image/')",
      });

      res.json(response.data.files);
    } catch (error) {
      console.error('Error fetching files from Google Drive:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  });
  
  // Upload file to Google Drive
  const upload = multer({ storage: multer.memoryStorage() });
  app.post("/api/google/drive/upload", upload.single('file'), async (req, res) => {
    const tokensCookie = req.cookies.google_drive_tokens;
    if (!tokensCookie) {
      return res.status(401).json({ error: 'Google Drive not connected' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const tokens = JSON.parse(tokensCookie);
      oauth2Client.setCredentials(tokens);

      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      
      const fileMetadata = {
        name: req.file.originalname,
      };
      
      const media = {
        mimeType: req.file.mimetype,
        body: Readable.from(req.file.buffer),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink',
      });

      res.json(response.data);
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // --- Microsoft OneDrive Integration ---

  // Helper to get Microsoft redirect URI dynamically
  const getMicrosoftRedirectUri = (req: express.Request) => {
    const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    return `${baseUrl}/auth/microsoft/callback`;
  };

  // Microsoft Auth URL
  app.get("/api/auth/microsoft/url", (req, res) => {
    if (!MS_CLIENT_ID) {
      return res.status(500).json({ error: "Microsoft Client ID is not configured" });
    }
    const redirectUri = getMicrosoftRedirectUri(req);
    
    const tenant = "common"; // Use "common" for multi-tenant apps
    const scope = "files.readwrite.all offline_access User.Read";
    
    const url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${MS_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=${encodeURIComponent(scope)}`;
    
    res.json({ url });
  });

  // Microsoft Auth Callback
  app.get("/auth/microsoft/callback", async (req, res) => {
    const { code } = req.query;
    const redirectUri = getMicrosoftRedirectUri(req);

    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
        qs.stringify({
          client_id: MS_CLIENT_ID,
          client_secret: MS_CLIENT_SECRET,
          code: code as string,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const tokens = response.data;
      
      // Store tokens in a secure cookie
      res.cookie('onedrive_tokens', JSON.stringify(tokens), {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'ONEDRIVE_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>تم ربط حساب OneDrive بنجاح. سيتم إغلاق هذه النافذة تلقائياً.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error('Error exchanging code for Microsoft tokens:', error.response?.data || error.message);
      res.status(500).send('Authentication failed');
    }
  });

  // Fetch OneDrive Files
  app.get("/api/microsoft/onedrive/files", async (req, res) => {
    const tokensCookie = req.cookies.onedrive_tokens;
    if (!tokensCookie) {
      return res.status(401).json({ error: 'OneDrive not connected' });
    }

    try {
      const tokens = JSON.parse(tokensCookie);
      const accessToken = tokens.access_token;

      const response = await axios.get(
        "https://graph.microsoft.com/v1.0/me/drive/root/children",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            $select: "id,name,webUrl,file,folder",
            $top: 50
          }
        }
      );

      // Filter for files and specific types if needed
      const files = response.data.value.filter((item: any) => item.file);

      res.json(files);
    } catch (error: any) {
      console.error('Error fetching files from OneDrive:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  });

  // Upload file to OneDrive
  app.post("/api/microsoft/onedrive/upload", upload.single('file'), async (req, res) => {
    const tokensCookie = req.cookies.onedrive_tokens;
    if (!tokensCookie) {
      return res.status(401).json({ error: 'OneDrive not connected' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const tokens = JSON.parse(tokensCookie);
      const accessToken = tokens.access_token;

      const fileName = req.file.originalname;
      const response = await axios.put(
        `https://graph.microsoft.com/v1.0/me/drive/root:/${encodeURIComponent(fileName)}:/content`,
        req.file.buffer,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": req.file.mimetype
          }
        }
      );

      res.json(response.data);
    } catch (error: any) {
      console.error('Error uploading to OneDrive:', error.response?.data || error.message);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
