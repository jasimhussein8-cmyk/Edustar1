import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("edustar.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('admin', 'teacher', 'student')),
    grade TEXT, -- For students
    section TEXT, -- For students
    assigned_grades TEXT, -- For teachers (comma separated)
    assigned_sections TEXT, -- For teachers (comma separated)
    subject TEXT, -- For teachers (legacy)
    assigned_subjects TEXT, -- For teachers (comma separated)
    full_name TEXT,
    google_id TEXT UNIQUE
  );
`);

// Migration: Ensure new columns exist in users table
const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
const columns = tableInfo.map(c => c.name);

if (!columns.includes('assigned_grades')) {
  db.exec("ALTER TABLE users ADD COLUMN assigned_grades TEXT");
}
if (!columns.includes('assigned_sections')) {
  db.exec("ALTER TABLE users ADD COLUMN assigned_sections TEXT");
}
if (!columns.includes('assigned_subjects')) {
  db.exec("ALTER TABLE users ADD COLUMN assigned_subjects TEXT");
}
if (!columns.includes('section')) {
  db.exec("ALTER TABLE users ADD COLUMN section TEXT");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    grade TEXT
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER,
    title TEXT,
    content TEXT,
    type TEXT, -- 'video', 'pdf', 'text'
    url TEXT,
    FOREIGN KEY(subject_id) REFERENCES subjects(id)
  );

  CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER,
    title TEXT,
    duration INTEGER, -- in minutes
    FOREIGN KEY(subject_id) REFERENCES subjects(id)
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER,
    question_text TEXT,
    options TEXT, -- JSON string
    correct_answer TEXT,
    type TEXT, -- 'mcq', 'tf', 'short'
    FOREIGN KEY(exam_id) REFERENCES exams(id)
  );

  CREATE TABLE IF NOT EXISTS exam_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    exam_id INTEGER,
    score INTEGER,
    total INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(exam_id) REFERENCES exams(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS grade_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grade TEXT,
    section TEXT,
    subject TEXT,
    category TEXT CHECK(category IN ('textbooks', 'videos', 'summaries', 'exams')),
    title TEXT,
    description TEXT,
    url TEXT,
    type TEXT, -- 'file', 'video', 'link'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    icon TEXT,
    criteria_type TEXT, -- 'exam_score', 'lessons_completed', 'points'
    criteria_value INTEGER
  );

  CREATE TABLE IF NOT EXISTS user_badges (
    user_id INTEGER,
    badge_id INTEGER,
    awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, badge_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(badge_id) REFERENCES badges(id)
  );

  CREATE TABLE IF NOT EXISTS user_points (
    user_id INTEGER PRIMARY KEY,
    points INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    cost INTEGER,
    icon TEXT,
    type TEXT
  );

  CREATE TABLE IF NOT EXISTS user_rewards (
    user_id INTEGER,
    reward_id INTEGER,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, reward_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(reward_id) REFERENCES rewards(id)
  );

  CREATE TABLE IF NOT EXISTS daily_activity (
    user_id INTEGER,
    activity_date DATE DEFAULT (DATE('now')),
    activity_count INTEGER DEFAULT 1,
    PRIMARY KEY(user_id, activity_date),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS study_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    lesson_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(lesson_id) REFERENCES lessons(id)
  );

  CREATE TABLE IF NOT EXISTS lesson_favorites (
    user_id INTEGER,
    lesson_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, lesson_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(lesson_id) REFERENCES lessons(id)
  );

  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content_type TEXT, -- 'lesson', 'exam', 'subject'
    content_id INTEGER,
    title TEXT,
    reason TEXT,
    priority TEXT, -- 'high', 'medium', 'low'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS lesson_completions (
    user_id INTEGER,
    lesson_id INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, lesson_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(lesson_id) REFERENCES lessons(id)
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER,
    title TEXT,
    description TEXT,
    due_date DATETIME,
    FOREIGN KEY(subject_id) REFERENCES subjects(id)
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER,
    user_id INTEGER,
    text_entry TEXT,
    file_url TEXT,
    file_name TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    grade INTEGER,
    feedback TEXT,
    FOREIGN KEY(assignment_id) REFERENCES assignments(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_google_tokens (
    user_id INTEGER PRIMARY KEY,
    access_token TEXT,
    refresh_token TEXT,
    expiry_date INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount INTEGER,
    method TEXT, -- 'zain_cash', 'mastercard'
    status TEXT, -- 'pending', 'completed', 'failed'
    transaction_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Migration: Check for missing columns in user_points
try {
  const columns = db.prepare("PRAGMA table_info(user_points)").all() as any[];
  if (!columns.some(c => c.name === 'xp')) {
    db.exec("ALTER TABLE user_points ADD COLUMN xp INTEGER DEFAULT 0");
    console.log("Added 'xp' column to user_points table");
  }
  if (!columns.some(c => c.name === 'coins')) {
    db.exec("ALTER TABLE user_points ADD COLUMN coins INTEGER DEFAULT 0");
    console.log("Added 'coins' column to user_points table");
  }

  // Users table migrations
  const userColumns = db.prepare("PRAGMA table_info(users)").all() as any[];
  if (!userColumns.some(c => c.name === 'section')) {
    db.exec("ALTER TABLE users ADD COLUMN section TEXT");
  }
  if (!userColumns.some(c => c.name === 'assigned_sections')) {
    db.exec("ALTER TABLE users ADD COLUMN assigned_sections TEXT");
  }
  if (!userColumns.some(c => c.name === 'assigned_subjects')) {
    db.exec("ALTER TABLE users ADD COLUMN assigned_subjects TEXT");
  }

  // Grade content migrations
  const contentColumns = db.prepare("PRAGMA table_info(grade_content)").all() as any[];
  if (!contentColumns.some(c => c.name === 'section')) {
    db.exec("ALTER TABLE grade_content ADD COLUMN section TEXT");
  }
  if (!contentColumns.some(c => c.name === 'subject')) {
    db.exec("ALTER TABLE grade_content ADD COLUMN subject TEXT");
  }
} catch (err) {
  console.error("Migration error:", err);
}

// Seed initial admin if not exists
db.prepare("INSERT OR IGNORE INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)").run(
  "admin",
  "admin123",
  "admin",
  "مدير النظام"
);

// Seed initial student
db.prepare("INSERT OR IGNORE INTO users (username, password, role, grade, full_name) VALUES (?, ?, ?, ?, ?)").run(
  "student",
  "student123",
  "student",
  "السادس الإعدادي",
  "أحمد محمد"
);

// Seed initial rewards if empty
const rewardCount = db.prepare("SELECT COUNT(*) as count FROM rewards").get() as { count: number };
if (rewardCount.count === 0) {
  const insertReward = db.prepare("INSERT INTO rewards (name, description, cost, icon, type) VALUES (?, ?, ?, ?, ?)");
  insertReward.run("خلفية ذهبية", "خلفية ذهبية مميزة لملفك الشخصي", 500, "Sparkles", "theme");
  insertReward.run("وسام العباقرة", "وسام خاص يظهر بجانب اسمك", 1000, "Award", "badge");
  insertReward.run("خصم 50% على الكتب", "خصم خاص على شراء الكتب الورقية من المتجر", 2000, "ShoppingBag", "discount");
  insertReward.run("أفاتار رائد فضاء", "أفاتار حصري لمستخدمي starEdu", 300, "User", "avatar");
  insertReward.run("تجميد السلسلة", "يحافظ على سلسلتك ليوم واحد إذا نسيت الدراسة", 150, "IceCream", "item");
}

// Seed initial teacher
db.prepare("INSERT OR IGNORE INTO users (username, password, role, grade, full_name) VALUES (?, ?, ?, ?, ?)").run(
  "teacher",
  "teacher123",
  "teacher",
  "السادس الإعدادي",
  "الأستاذ علي"
);

// Seed initial subjects
const subjectsCount = db.prepare("SELECT COUNT(*) as count FROM subjects").get() as { count: number };
if (subjectsCount.count === 0) {
  const initialSubjects = [
    { name: "الرياضيات", grade: "السادس الإعدادي" },
    { name: "الفيزياء", grade: "السادس الإعدادي" },
    { name: "الكيمياء", grade: "السادس الإعدادي" },
    { name: "الأحياء", grade: "السادس الإعدادي" },
    { name: "اللغة العربية", grade: "السادس الإعدادي" },
    { name: "التاريخ", grade: "السادس الإعدادي" },
  ];
  const insertSubject = db.prepare("INSERT INTO subjects (name, grade) VALUES (?, ?)");
  initialSubjects.forEach(s => insertSubject.run(s.name, s.grade));
}

// Seed initial badges
const badgesCount = db.prepare("SELECT COUNT(*) as count FROM badges").get() as { count: number };
if (badgesCount.count === 0) {
  const initialBadges = [
    { name: "المجتهد", description: "أكمل 5 دروس", icon: "BookOpen", criteria_type: "lessons_completed", criteria_value: 5 },
    { name: "العلامة الكاملة", description: "حصل على 100% في امتحان", icon: "Award", criteria_type: "exam_score", criteria_value: 100 },
    { name: "نجم ساطع", description: "جمع 500 نقطة", icon: "Star", criteria_type: "points", criteria_value: 500 },
    { name: "المثابر", description: "أكمل 10 دروس", icon: "Zap", criteria_type: "lessons_completed", criteria_value: 10 },
  ];
  const insertBadge = db.prepare("INSERT INTO badges (name, description, icon, criteria_type, criteria_value) VALUES (?, ?, ?, ?, ?)");
  initialBadges.forEach(b => insertBadge.run(b.name, b.description, b.icon, b.criteria_type, b.criteria_value));
}

// Seed initial assignments
const assignmentsCount = db.prepare("SELECT COUNT(*) as count FROM assignments").get() as { count: number };
if (assignmentsCount.count === 0) {
  const mathSubject = db.prepare("SELECT id FROM subjects WHERE name = 'الرياضيات' AND grade = 'السادس الإعدادي'").get() as { id: number };
  if (mathSubject) {
    db.prepare("INSERT INTO assignments (subject_id, title, description, due_date) VALUES (?, ?, ?, ?)").run(
      mathSubject.id,
      "واجب التفاضل والتكامل",
      "يرجى حل المسائل الموجودة في صفحة 45 من الكتاب المدرسي ورفع الحل هنا.",
      "2026-03-15"
    );
  }
  const physicsSubject = db.prepare("SELECT id FROM subjects WHERE name = 'الفيزياء' AND grade = 'السادس الإعدادي'").get() as { id: number };
  if (physicsSubject) {
    db.prepare("INSERT INTO assignments (subject_id, title, description, due_date) VALUES (?, ?, ?, ?)").run(
      physicsSubject.id,
      "تقرير الميكانيكا",
      "اكتب تقريراً عن قوانين نيوتن للحركة مع أمثلة تطبيقية.",
      "2026-03-20"
    );
  }
}

export async function createServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  app.get("/ping", (req, res) => res.send("pong"));

  // Configure Multer for file uploads
  const uploadDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });

  const upload = multer({ storage });

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // API Routes
  app.get("/api/auth/google/drive/url", (req, res) => {
    const redirectUri = `${process.env.APP_URL}/auth/google/drive/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file",
      access_type: "offline",
      prompt: "consent",
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    res.json({ url: authUrl });
  });

  app.get("/auth/google/drive/callback", async (req, res) => {
    const { code, state } = req.query;
    if (!code) return res.status(400).send("No code provided");

    try {
      const redirectUri = `${process.env.APP_URL}/auth/google/drive/callback`;
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokens = await tokenResponse.json();
      if (tokens.error) throw new Error(tokens.error_description);

      const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const googleUser = await userResponse.json();

      // Find user by google_id
      let user = db.prepare("SELECT * FROM users WHERE google_id = ?").get(googleUser.sub);
      
      // If not found, try by email (username)
      if (!user) {
        user = db.prepare("SELECT * FROM users WHERE username = ?").get(googleUser.email);
      }

      if (user) {
        // Store tokens
        db.prepare(`
          INSERT INTO user_google_tokens (user_id, access_token, refresh_token, expiry_date)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            access_token = excluded.access_token,
            refresh_token = COALESCE(excluded.refresh_token, refresh_token),
            expiry_date = excluded.expiry_date
        `).run(user.id, tokens.access_token, tokens.refresh_token, Date.now() + (tokens.expires_in * 1000));
      }

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
            <p>Google Drive connected successfully. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Google Drive OAuth Error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  app.get("/api/google/drive/files", async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    const tokens = db.prepare("SELECT * FROM user_google_tokens WHERE user_id = ?").get(userId) as any;
    if (!tokens) return res.status(401).json({ error: "Google Drive not connected" });

    // TODO: Refresh token if expired

    try {
      const driveResponse = await fetch("https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,webViewLink,iconLink)", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const data = await driveResponse.json();
      res.json(data.files || []);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/google/url", (req, res) => {
    const redirectUri = `${process.env.APP_URL}/auth/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    res.json({ url: authUrl });
  });

  app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("No code provided");

    try {
      const redirectUri = `${process.env.APP_URL}/auth/callback`;
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokens = await tokenResponse.json();
      if (tokens.error) throw new Error(tokens.error_description);

      const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const googleUser = await userResponse.json();

      // Find or create user
      let user = db.prepare("SELECT * FROM users WHERE google_id = ?").get(googleUser.sub);
      if (!user) {
        // For demo, we auto-register Google users as students
        const result = db.prepare("INSERT INTO users (username, full_name, role, google_id, grade) VALUES (?, ?, ?, ?, ?)").run(
          googleUser.email,
          googleUser.name,
          'student',
          googleUser.sub,
          '6th Secondary' // Default grade for demo
        );
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
      }

      const userData = JSON.stringify({
        id: user.id,
        username: user.username,
        role: user.role,
        grade: user.grade,
        full_name: user.full_name
      });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${userData} }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Google OAuth Error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  app.post("/api/auth/login", (req, res) => {
    let { username, password } = req.body;
    username = username?.trim();
    password = password?.trim();
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    if (user) {
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role, 
          grade: user.grade, 
          section: user.section,
          assigned_grades: user.assigned_grades ? user.assigned_grades.split(',') : [],
          assigned_sections: user.assigned_sections ? user.assigned_sections.split(',') : [],
          subject: user.subject,
          assigned_subjects: user.assigned_subjects ? user.assigned_subjects.split(',') : [],
          full_name: user.full_name 
        } 
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { username, password, role, grade, section, assigned_grades, assigned_sections, assigned_subjects, subject, full_name } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (username, password, role, grade, section, assigned_grades, assigned_sections, assigned_subjects, subject, full_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
        username,
        password,
        role || 'student',
        grade,
        section,
        assigned_grades ? assigned_grades.join(',') : null,
        assigned_sections ? assigned_sections.join(',') : null,
        assigned_subjects ? assigned_subjects.join(',') : null,
        subject,
        full_name
      );
      res.json({ success: true, userId: result.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  app.get("/api/subjects/:grade", (req, res) => {
    try {
      const subjects = db.prepare("SELECT * FROM subjects WHERE grade = ?").all(req.params.grade);
      res.json(subjects);
    } catch (err: any) {
      console.error("Error fetching subjects:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/lessons/:subjectId", (req, res) => {
    const lessons = db.prepare("SELECT * FROM lessons WHERE subject_id = ?").all(req.params.subjectId);
    res.json(lessons);
  });

  app.get("/api/admin/exams/:subjectId", (req, res) => {
    const exams = db.prepare("SELECT * FROM exams WHERE subject_id = ?").all(req.params.subjectId);
    res.json(exams);
  });

  app.post("/api/admin/exams", (req, res) => {
    const { subjectId, title, duration } = req.body;
    const result = db.prepare("INSERT INTO exams (subject_id, title, duration) VALUES (?, ?, ?)").run(subjectId, title, duration);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/admin/exams/:id", (req, res) => {
    db.prepare("DELETE FROM questions WHERE exam_id = ?").run(req.params.id);
    db.prepare("DELETE FROM exams WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/questions/:examId", (req, res) => {
    const questions = db.prepare("SELECT * FROM questions WHERE exam_id = ?").all(req.params.examId);
    res.json(questions.map((q: any) => ({ ...q, options: JSON.parse(q.options) })));
  });

  app.post("/api/admin/questions", (req, res) => {
    const { examId, questionText, options, correctAnswer, type } = req.body;
    const result = db.prepare("INSERT INTO questions (exam_id, question_text, options, correct_answer, type) VALUES (?, ?, ?, ?, ?)").run(
      examId, questionText, JSON.stringify(options), correctAnswer, type
    );
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/admin/questions/:id", (req, res) => {
    db.prepare("DELETE FROM questions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/exams-by-grade/:grade", (req, res) => {
    const exams = db.prepare(`
      SELECT e.*, s.name as subject_name 
      FROM exams e 
      JOIN subjects s ON e.subject_id = s.id 
      WHERE s.grade = ?
    `).all(req.params.grade);
    res.json(exams);
  });

  app.get("/api/exam-questions/:examId", (req, res) => {
    const questions = db.prepare("SELECT * FROM questions WHERE exam_id = ?").all(req.params.examId);
    res.json(questions.map((q: any) => ({ ...q, options: JSON.parse(q.options) })));
  });

  app.post("/api/exams/submit", (req, res) => {
    const { userId, examId, score, total } = req.body;
    db.prepare("INSERT INTO exam_results (user_id, exam_id, score, total) VALUES (?, ?, ?, ?)").run(userId, examId, score, total);
    
    // Award points for exam completion (e.g., 50 points base + bonus for score)
    const pointsEarned = 50 + Math.floor((score / total) * 50);
    db.prepare(`
      INSERT INTO user_points (user_id, points) VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET points = points + ?, last_updated = CURRENT_TIMESTAMP
    `).run(userId, pointsEarned, pointsEarned);

    // Check for badges
    const percentage = (score / total) * 100;
    const badges = db.prepare("SELECT * FROM badges WHERE criteria_type = 'exam_score' AND criteria_value <= ?").all(percentage);
    const insertUserBadge = db.prepare("INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)");
    badges.forEach((b: any) => insertUserBadge.run(userId, b.id));

    res.json({ success: true, pointsEarned });
  });

  // Helper to update activity and streak
  const updateActivity = (userId: number) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO daily_activity (user_id, activity_date, activity_count) 
      VALUES (?, ?, 1)
      ON CONFLICT(user_id, activity_date) DO UPDATE SET activity_count = activity_count + 1
    `).run(userId, today);

    const stats = db.prepare("SELECT streak, last_activity_date FROM user_points WHERE user_id = ?").get(userId) as any;
    
    if (stats) {
      let newStreak = stats.streak;
      if (stats.last_activity_date === yesterday) {
        newStreak += 1;
      } else if (stats.last_activity_date !== today) {
        newStreak = 1;
      }
      
      db.prepare("UPDATE user_points SET streak = ?, last_activity_date = ? WHERE user_id = ?").run(newStreak, today, userId);
    } else {
      db.prepare("INSERT INTO user_points (user_id, points, xp, level, streak, last_activity_date) VALUES (?, 0, 0, 1, 1, ?)").run(userId, today);
    }
  };

  // Gamification Routes
  app.get("/api/gamification/stats/:userId", (req, res) => {
    try {
      const userId = req.params.userId;
      const stats = db.prepare("SELECT points, xp, coins, level, streak FROM user_points WHERE user_id = ?").get(userId) || { points: 0, xp: 0, coins: 0, level: 1, streak: 0 };
      
      const badges = db.prepare(`
        SELECT b.*, ub.awarded_at 
        FROM badges b 
        JOIN user_badges ub ON b.id = ub.badge_id 
        WHERE ub.user_id = ?
      `).all(userId);
      
      const lessonsCompleted = db.prepare("SELECT COUNT(*) as count FROM lesson_completions WHERE user_id = ?").get(userId) as { count: number };
      
      const weeklyActivity = db.prepare(`
        SELECT activity_date as day, activity_count as count 
        FROM daily_activity 
        WHERE user_id = ? AND activity_date >= DATE('now', '-7 days')
        ORDER BY activity_date ASC
      `).all(userId);

      const nextLevelXp = (stats as any).level * 1000;

      res.json({ 
        points: (stats as any).points, 
        xp: (stats as any).xp,
        coins: (stats as any).coins || 0,
        level: (stats as any).level,
        streak: (stats as any).streak,
        nextLevelXp,
        badges,
        lessonsCompleted: lessonsCompleted.count,
        weeklyActivity
      });
    } catch (err: any) {
      console.error("Error fetching gamification stats:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/gamification/leaderboard/:grade", (req, res) => {
    const leaderboard = db.prepare(`
      SELECT u.id, u.full_name, up.points, u.grade
      FROM users u
      JOIN user_points up ON u.id = up.user_id
      WHERE u.grade = ?
      ORDER BY up.points DESC
      LIMIT 10
    `).all(req.params.grade);
    res.json(leaderboard);
  });

  app.get("/api/gamification/favorites/:userId", (req, res) => {
    try {
      const favorites = db.prepare(`
        SELECT lf.*, l.title as lesson_title, s.name as subject_name
        FROM lesson_favorites lf
        JOIN lessons l ON lf.lesson_id = l.id
        JOIN subjects s ON l.subject_id = s.id
        WHERE lf.user_id = ?
      `).all(req.params.userId);
      res.json(favorites);
    } catch (err: any) {
      console.error("Error fetching favorites:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/gamification/complete-lesson", (req, res) => {
    const { userId, lessonId } = req.body;
    try {
      db.prepare("INSERT OR IGNORE INTO lesson_completions (user_id, lesson_id) VALUES (?, ?)").run(userId, lessonId);
      
      // Award points, XP and coins
      const pointsEarned = 20;
      const xpEarned = 50;
      const coinsEarned = 10;
      
      db.prepare(`
        INSERT INTO user_points (user_id, points, xp, coins) VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET 
          points = points + ?, 
          xp = xp + ?,
          coins = coins + ?,
          last_updated = CURRENT_TIMESTAMP
      `).run(userId, pointsEarned, xpEarned, coinsEarned, pointsEarned, xpEarned, coinsEarned);

      // Check for level up
      const stats = db.prepare("SELECT xp, level FROM user_points WHERE user_id = ?").get(userId) as any;
      const nextLevelXp = stats.level * 1000;
      if (stats.xp >= nextLevelXp) {
        db.prepare("UPDATE user_points SET level = level + 1 WHERE user_id = ?").run(userId);
      }

      updateActivity(userId);

      // Check for badges based on lessons completed
      const count = db.prepare("SELECT COUNT(*) as count FROM lesson_completions WHERE user_id = ?").get(userId) as { count: number };
      const badges = db.prepare("SELECT * FROM badges WHERE criteria_type = 'lessons_completed' AND criteria_value <= ?").all(count.count);
      const insertUserBadge = db.prepare("INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)");
      badges.forEach((b: any) => insertUserBadge.run(userId, b.id));

      res.json({ success: true, pointsEarned, xpEarned, coinsEarned });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  app.get("/api/subjects/progress/:userId/:grade", (req, res) => {
    const { userId, grade } = req.params;
    const subjects = db.prepare("SELECT * FROM subjects WHERE grade = ?").all(grade) as any[];
    const progress = subjects.map(s => {
      const total = db.prepare("SELECT COUNT(*) as count FROM lessons WHERE subject_id = ?").get(s.id) as { count: number };
      const completed = db.prepare("SELECT COUNT(*) as count FROM lesson_completions WHERE user_id = ? AND lesson_id IN (SELECT id FROM lessons WHERE subject_id = ?)").get(userId, s.id) as { count: number };
      return {
        subjectId: s.id,
        subjectName: s.name,
        total: total.count,
        completed: completed.count,
        percentage: total.count > 0 ? Math.round((completed.count / total.count) * 100) : 0
      };
    });
    res.json(progress);
  });

  // Payment Routes
  app.post("/api/payments/initiate", (req, res) => {
    const { userId, amount, method } = req.body;
    const transactionId = "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    db.prepare("INSERT INTO payments (user_id, amount, method, status, transaction_id) VALUES (?, ?, ?, ?, ?)").run(
      userId, amount, method, 'pending', transactionId
    );

    // Mock Zain Cash Redirect URL
    // In a real app, you'd call Zain Cash API here to get a token and redirect URL
    const redirectUrl = method === 'zain_cash' 
      ? `https://test.zaincash.iq/transaction/pay?id=${transactionId}`
      : `https://checkout.stripe.com/pay/${transactionId}`;

    res.json({ success: true, redirectUrl, transactionId });
  });

  app.post("/api/payments/verify", (req, res) => {
    const { transactionId, status } = req.body;
    db.prepare("UPDATE payments SET status = ? WHERE transaction_id = ?").run(status, transactionId);
    
    if (status === 'completed') {
      const payment = db.prepare("SELECT * FROM payments WHERE transaction_id = ?").get(transactionId) as any;
      // Award coins or unlock content based on payment
      const coinsAwarded = Math.floor(payment.amount / 10); // 10 IQD = 1 coin (example)
      db.prepare("UPDATE user_points SET coins = coins + ? WHERE user_id = ?").run(coinsAwarded, payment.user_id);
    }
    
    res.json({ success: true });
  });

  app.get("/api/payments/history/:userId", (req, res) => {
    const history = db.prepare("SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC").all(req.params.userId);
    res.json(history);
  });

  app.get("/api/messages/:userId", (req, res) => {
    const messages = db.prepare(`
      SELECT m.*, u.full_name as sender_name 
      FROM messages m 
      JOIN users u ON m.sender_id = u.id 
      WHERE receiver_id = ? OR sender_id = ?
      ORDER BY created_at ASC
    `).all(req.params.userId, req.params.userId);
    res.json(messages);
  });

  app.post("/api/messages", (req, res) => {
    const { senderId, receiverId, content } = req.body;
    db.prepare("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)").run(senderId, receiverId, content);
    res.json({ success: true });
  });

  // Grade Content Routes
  app.get("/api/grade-content/:grade/:category", (req, res) => {
    const { section, subject } = req.query;
    let query = "SELECT * FROM grade_content WHERE grade = ? AND category = ?";
    const params: any[] = [req.params.grade, req.params.category];

    if (section) {
      query += " AND (section = ? OR section IS NULL OR section = '')";
      params.push(section);
    }
    if (subject) {
      query += " AND (subject = ? OR subject IS NULL OR subject = '')";
      params.push(subject);
    }

    query += " ORDER BY created_at DESC";
    const content = db.prepare(query).all(...params);
    res.json(content);
  });

  app.post("/api/grade-content", upload.single('file'), (req, res) => {
    const { grade, category, title, description, type, section, subject } = req.body;
    let { url } = req.body;

    if (req.file) {
      url = `/uploads/${req.file.filename}`;
    }

    db.prepare("INSERT INTO grade_content (grade, category, title, description, url, type, section, subject) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(grade, category, title, description, url, type, section, subject);
    res.json({ success: true });
  });

  app.delete("/api/grade-content/:id", (req, res) => {
    db.prepare("DELETE FROM grade_content WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // AI Study Assistant
  app.post("/api/ai/study-assistant", async (req, res) => {
    const { userId, message, context } = req.body;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          You are a helpful study assistant for a student.
          Context: ${context || 'General study help'}
          User Question: ${message}
          Provide a helpful, encouraging, and clear explanation in Arabic.
        `,
      });
      
      updateActivity(userId);
      res.json({ response: response.text });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Study Notes
  app.get("/api/notes/:userId/:lessonId", (req, res) => {
    const note = db.prepare("SELECT * FROM study_notes WHERE user_id = ? AND lesson_id = ?").get(req.params.userId, req.params.lessonId);
    res.json(note || { content: '' });
  });

  app.post("/api/notes", (req, res) => {
    const { userId, lessonId, content } = req.body;
    db.prepare(`
      INSERT INTO study_notes (user_id, lesson_id, content, updated_at) 
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, lesson_id) DO UPDATE SET content = ?, updated_at = CURRENT_TIMESTAMP
    `).run(userId, lessonId, content, content);
    res.json({ success: true });
  });

  // Admin Routes
  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users.map((u: any) => ({
      ...u,
      assigned_grades: (u.assigned_grades && u.assigned_grades !== "") ? u.assigned_grades.split(',') : [],
      assigned_sections: (u.assigned_sections && u.assigned_sections !== "") ? u.assigned_sections.split(',') : [],
      assigned_subjects: (u.assigned_subjects && u.assigned_subjects !== "") ? u.assigned_subjects.split(',') : [],
    })));
  });

  app.post("/api/admin/users", (req, res) => {
    const { username, password, role, grade, section, assigned_grades, assigned_sections, assigned_subjects, full_name } = req.body;
    console.log("Adding user:", { username, role, full_name });
    try {
      const result = db.prepare(`
        INSERT INTO users (username, password, role, grade, section, assigned_grades, assigned_sections, assigned_subjects, full_name) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        username,
        password,
        role,
        grade || null,
        section || null,
        assigned_grades && assigned_grades.length > 0 ? assigned_grades.join(',') : null,
        assigned_sections && assigned_sections.length > 0 ? assigned_sections.join(',') : null,
        assigned_subjects && assigned_subjects.length > 0 ? assigned_subjects.join(',') : null,
        full_name
      );
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err: any) {
      console.error("Error adding user:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  });

  app.put("/api/admin/users/:id", (req, res) => {
    const { username, role, grade, section, assigned_grades, assigned_sections, assigned_subjects, full_name, password } = req.body;
    console.log("Updating user:", { id: req.params.id, username, role });
    try {
      if (password) {
        db.prepare(`
          UPDATE users SET 
            username = ?, role = ?, grade = ?, section = ?, 
            assigned_grades = ?, assigned_sections = ?, assigned_subjects = ?, 
            full_name = ?, password = ? 
          WHERE id = ?
        `).run(
          username, role, grade || null, section || null, 
          assigned_grades && assigned_grades.length > 0 ? assigned_grades.join(',') : null,
          assigned_sections && assigned_sections.length > 0 ? assigned_sections.join(',') : null,
          assigned_subjects && assigned_subjects.length > 0 ? assigned_subjects.join(',') : null,
          full_name, password, req.params.id
        );
      } else {
        db.prepare(`
          UPDATE users SET 
            username = ?, role = ?, grade = ?, section = ?, 
            assigned_grades = ?, assigned_sections = ?, assigned_subjects = ?, 
            full_name = ? 
          WHERE id = ?
        `).run(
          username, role, grade || null, section || null, 
          assigned_grades && assigned_grades.length > 0 ? assigned_grades.join(',') : null,
          assigned_sections && assigned_sections.length > 0 ? assigned_sections.join(',') : null,
          assigned_subjects && assigned_subjects.length > 0 ? assigned_subjects.join(',') : null,
          full_name, req.params.id
        );
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error updating user:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/subjects", (req, res) => {
    const { name, grade } = req.body;
    db.prepare("INSERT INTO subjects (name, grade) VALUES (?, ?)").run(name, grade);
    res.json({ success: true });
  });

  app.put("/api/admin/subjects/:id", (req, res) => {
    const { name, grade } = req.body;
    db.prepare("UPDATE subjects SET name = ?, grade = ? WHERE id = ?").run(name, grade, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/subjects/:id", (req, res) => {
    db.prepare("DELETE FROM subjects WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/lessons", upload.single('file'), (req, res) => {
    const { subjectId, title, content, type } = req.body;
    let { url } = req.body;
    
    // If a file was uploaded, use its path as the URL
    if (req.file) {
      url = `/uploads/${req.file.filename}`;
    }
    
    db.prepare("INSERT INTO lessons (subject_id, title, content, type, url) VALUES (?, ?, ?, ?, ?)").run(subjectId, title, content, type, url);
    res.json({ success: true });
  });

  app.put("/api/admin/lessons/:id", (req, res) => {
    const { title, content, type, url } = req.body;
    db.prepare("UPDATE lessons SET title = ?, content = ?, type = ?, url = ? WHERE id = ?").run(title, content, type, url, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/lessons/:id", (req, res) => {
    db.prepare("DELETE FROM lessons WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Assignment & Submission Routes
  app.get("/api/assignments/:grade", (req, res) => {
    const assignments = db.prepare(`
      SELECT a.*, s.name as subject_name 
      FROM assignments a 
      JOIN subjects s ON a.subject_id = s.id 
      WHERE s.grade = ?
    `).all(req.params.grade);
    res.json(assignments);
  });

  app.post("/api/admin/assignments", (req, res) => {
    const { subjectId, title, description, dueDate } = req.body;
    db.prepare("INSERT INTO assignments (subject_id, title, description, due_date) VALUES (?, ?, ?, ?)").run(subjectId, title, description, dueDate);
    res.json({ success: true });
  });

  app.put("/api/admin/assignments/:id", (req, res) => {
    const { title, description, dueDate } = req.body;
    db.prepare("UPDATE assignments SET title = ?, description = ?, due_date = ? WHERE id = ?").run(title, description, dueDate, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/assignments/:id", (req, res) => {
    db.prepare("DELETE FROM assignments WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/submissions", upload.single("file"), (req, res) => {
    const { assignmentId, userId, textEntry } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const fileName = req.file ? req.file.originalname : null;

    try {
      db.prepare(`
        INSERT INTO submissions (assignment_id, user_id, text_entry, file_url, file_name) 
        VALUES (?, ?, ?, ?, ?)
      `).run(assignmentId, userId, textEntry, fileUrl, fileName);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  app.get("/api/submissions/user/:userId", (req, res) => {
    const submissions = db.prepare(`
      SELECT s.*, a.title as assignment_title 
      FROM submissions s 
      JOIN assignments a ON s.assignment_id = a.id 
      WHERE s.user_id = ?
    `).all(req.params.userId);
    res.json(submissions);
  });

  app.get("/api/submissions/assignment/:assignmentId", (req, res) => {
    const submissions = db.prepare(`
      SELECT s.*, u.full_name as student_name 
      FROM submissions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.assignment_id = ?
    `).all(req.params.assignmentId);
    res.json(submissions);
  });

  app.post("/api/submissions/grade", (req, res) => {
    const { submissionId, grade, feedback } = req.body;
    db.prepare("UPDATE submissions SET grade = ?, feedback = ? WHERE id = ?").run(grade, feedback, submissionId);
    res.json({ success: true });
  });

  // Rewards Routes
  app.get("/api/rewards", (req, res) => {
    const rewards = db.prepare("SELECT * FROM rewards").all();
    res.json(rewards);
  });

  app.get("/api/rewards/user/:userId", (req, res) => {
    const rewards = db.prepare(`
      SELECT r.*, ur.purchased_at 
      FROM rewards r 
      JOIN user_rewards ur ON r.id = ur.reward_id 
      WHERE ur.user_id = ?
    `).all(req.params.userId);
    res.json(rewards);
  });

  app.post("/api/rewards/purchase", (req, res) => {
    const { userId, rewardId } = req.body;
    const reward = db.prepare("SELECT * FROM rewards WHERE id = ?").get(rewardId) as any;
    const userPoints = db.prepare("SELECT coins FROM user_points WHERE user_id = ?").get(userId) as any;

    if (!reward || !userPoints) return res.status(404).json({ success: false, message: "Reward or user not found" });
    if (userPoints.coins < reward.cost) return res.status(400).json({ success: false, message: "Insufficient coins" });

    try {
      db.transaction(() => {
        db.prepare("UPDATE user_points SET coins = coins - ? WHERE user_id = ?").run(reward.cost, userId);
        db.prepare("INSERT INTO user_rewards (user_id, reward_id) VALUES (?, ?)").run(userId, rewardId);
      })();
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  // Recommendation Routes
  app.get("/api/recommendations/:userId", (req, res) => {
    try {
      const recommendations = db.prepare("SELECT * FROM recommendations WHERE user_id = ? ORDER BY created_at DESC LIMIT 5").all(req.params.userId);
      res.json(recommendations);
    } catch (err: any) {
      console.error("Error fetching recommendations:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/recommendations/generate", async (req, res) => {
    const { userId } = req.body;
    
    try {
      // 1. Fetch student data
      const examResults = db.prepare(`
        SELECT er.*, e.title as exam_title, s.name as subject_name 
        FROM exam_results er
        JOIN exams e ON er.exam_id = e.id
        JOIN subjects s ON e.subject_id = s.id
        WHERE er.user_id = ?
      `).all(userId);

      const lessonCompletions = db.prepare(`
        SELECT lc.*, l.title as lesson_title, s.name as subject_name
        FROM lesson_completions lc
        JOIN lessons l ON lc.lesson_id = l.id
        JOIN subjects s ON l.subject_id = s.id
        WHERE lc.user_id = ?
      `).all(userId);

      const user = db.prepare("SELECT grade FROM users WHERE id = ?").get(userId) as { grade: string };
      const availableContent = db.prepare(`
        SELECT 'lesson' as type, l.id, l.title, s.name as subject_name
        FROM lessons l
        JOIN subjects s ON l.subject_id = s.id
        WHERE s.grade = ?
        UNION ALL
        SELECT 'exam' as type, e.id, e.title, s.name as subject_name
        FROM exams e
        JOIN subjects s ON e.subject_id = s.id
        WHERE s.grade = ?
      `).all(user.grade, user.grade);

      // 2. Use Gemini to analyze and recommend
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `
        Analyze this student's performance and recommend the next 3 most beneficial learning items (lessons or exams).
        Student Grade: ${user.grade}
        
        Exam Results: ${JSON.stringify(examResults)}
        Lesson Completions: ${JSON.stringify(lessonCompletions)}
        
        Available Content to Recommend: ${JSON.stringify(availableContent)}
        
        Return a JSON array of objects with these properties:
        - content_type: 'lesson' or 'exam'
        - content_id: the ID from the available content
        - title: the title of the content
        - reason: a brief, encouraging explanation in Arabic why this is recommended
        - priority: 'high', 'medium', or 'low'
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const recommendations = JSON.parse(response.text || "[]");

      // 3. Store recommendations
      db.prepare("DELETE FROM recommendations WHERE user_id = ?").run(userId);
      const insertRec = db.prepare(`
        INSERT INTO recommendations (user_id, content_type, content_id, title, reason, priority)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const rec of recommendations) {
        insertRec.run(userId, rec.content_type, rec.content_id, rec.title, rec.reason, rec.priority);
      }

      res.json({ success: true, recommendations });
    } catch (err: any) {
      console.error("Failed to generate recommendations:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  return app;
}

async function startServer() {
  console.log("Starting server...");
  const app = await createServer();
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Running in development mode");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Serve index.html for all non-API routes in dev mode
    app.get("*", async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        console.error("Vite transform error:", e);
        next(e);
      }
    });
  } else {
    console.log("Running in production mode");
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
