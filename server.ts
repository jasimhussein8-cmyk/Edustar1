import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Google OAuth Configuration
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL}/auth/google/callback`
  );

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Google Auth URL
  app.get("/api/auth/google/drive/url", (req, res) => {
    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const dynamicRedirectUri = `${origin}/auth/google/callback`;
    
    const scopes = [
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/drive.readonly'
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
    const origin = `${req.protocol}://${req.get('host')}`;
    const dynamicRedirectUri = `${origin}/auth/google/callback`;

    try {
      const { tokens } = await oauth2Client.getToken({
        code: code as string,
        redirect_uri: dynamicRedirectUri
      });
      
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
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      res.status(500).send('Authentication failed');
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
