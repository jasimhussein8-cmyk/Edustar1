import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import multer from "multer";
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
  
  // Multer configuration for file uploads
  const storage = multer.memoryStorage();
  const upload = multer({ storage });
  
  // CORS Configuration for Android and Web
  app.use(cors({
    origin: (origin, callback) => {
      // Allow all origins for now to fix Android issues, or specify your app's origins
      // Common Capacitor origins: http://localhost, capacitor://localhost
      callback(null, true);
    },
    credentials: true
  }));

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

  // --- Microsoft OneDrive Integration ---

  // Helper to refresh Microsoft token
  const refreshMicrosoftToken = async (refreshToken: string) => {
    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
        qs.stringify({
          client_id: MS_CLIENT_ID,
          client_secret: MS_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error refreshing Microsoft token:', error.response?.data || error.message);
      throw error;
    }
  };

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
      let tokens = JSON.parse(tokensCookie);
      let accessToken = tokens.access_token;

      try {
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
        const files = response.data.value.filter((item: any) => item.file);
        return res.json(files);
      } catch (error: any) {
        if (error.response?.status === 401 && tokens.refresh_token) {
          // Token expired, try refreshing
          const newTokens = await refreshMicrosoftToken(tokens.refresh_token);
          tokens = { ...tokens, ...newTokens };
          res.cookie('onedrive_tokens', JSON.stringify(tokens), {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000
          });
          accessToken = tokens.access_token;
          
          const retryResponse = await axios.get(
            "https://graph.microsoft.com/v1.0/me/drive/root/children",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: {
                $select: "id,name,webUrl,file,folder",
                $top: 50
              }
            }
          );
          const files = retryResponse.data.value.filter((item: any) => item.file);
          return res.json(files);
        }
        throw error;
      }
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
      let tokens = JSON.parse(tokensCookie);
      let accessToken = tokens.access_token;

      const fileName = req.file.originalname;
      
      const uploadToOneDrive = async (token: string) => {
        return await axios.put(
          `https://graph.microsoft.com/v1.0/me/drive/root:/${encodeURIComponent(fileName)}:/content`,
          req.file!.buffer,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": req.file!.mimetype
            }
          }
        );
      };

      try {
        const response = await uploadToOneDrive(accessToken);
        return res.json(response.data);
      } catch (error: any) {
        if (error.response?.status === 401 && tokens.refresh_token) {
          const newTokens = await refreshMicrosoftToken(tokens.refresh_token);
          tokens = { ...tokens, ...newTokens };
          res.cookie('onedrive_tokens', JSON.stringify(tokens), {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000
          });
          accessToken = tokens.access_token;
          const retryResponse = await uploadToOneDrive(accessToken);
          return res.json(retryResponse.data);
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Error uploading to OneDrive:', error.response?.data || error.message);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // --- Payment Integration (Zain Cash & Mastercard) ---

  // Mock Zain Cash Initiation
  app.post("/api/payments/zain-cash/initiate", async (req, res) => {
    const { amount, userId } = req.body;
    
    // In a real scenario, you would call Zain Cash API here
    // For now, we simulate the redirect URL
    const transactionId = "ZC-" + Math.random().toString(36).substr(2, 9);
    
    // Mock redirect URL
    const redirectUrl = `https://test.zaincash.iq/transaction/pay?id=${transactionId}`;
    
    res.json({ 
      success: true, 
      transactionId,
      redirectUrl
    });
  });

  // Mock Mastercard Initiation
  app.post("/api/payments/mastercard/initiate", async (req, res) => {
    const { amount, userId } = req.body;
    
    // In a real scenario, you would call a payment gateway like Stripe or local provider
    const transactionId = "MC-" + Math.random().toString(36).substr(2, 9);
    
    res.json({ 
      success: true, 
      transactionId,
      redirectUrl: `https://checkout.example.com/pay?id=${transactionId}`
    });
  });

  // Payment Callback/Verification
  app.post("/api/payments/verify", async (req, res) => {
    const { transactionId, status } = req.body;
    
    // Verify transaction with provider
    // For mock, we just return success
    res.json({ 
      success: true, 
      status: 'completed',
      message: 'Payment verified successfully'
    });
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
