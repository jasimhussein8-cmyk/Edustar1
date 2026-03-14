import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  MessageSquare, 
  ClipboardList, 
  LayoutDashboard, 
  LogOut, 
  ChevronRight, 
  PlayCircle, 
  FileText, 
  CheckCircle2,
  Send,
  Plus,
  Settings,
  Bell,
  Trophy,
  Zap,
  Award,
  Star,
  TrendingUp,
  Upload,
  Calendar,
  Clock,
  FileUp,
  Sun,
  Moon,
  Link,
  Eye,
  Trash2,
  XCircle,
  X,
  Pencil,
  Sparkles,
  ShoppingBag,
  IceCream,
  Coins,
  Timer,
  Brain,
  Layout,
  Heart,
  Share2,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  StickyNote,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { getApiUrl } from "./config";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar
} from 'recharts';
import { User, Subject, Lesson, Exam, Question, Message, Role, UserStats, LeaderboardEntry, SubjectProgress, Assignment, Submission, Recommendation, Reward } from './types';

// --- Components ---

const StudyAssistant = ({ user, context }: { user: User, context?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMsg = message;
    setMessage('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/ai/study-assistant'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, message: userMsg, context })
      });
      const data = await res.json();
      setChat(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 w-80 md:w-96 h-[500px] rounded-3xl shadow-2xl border border-indigo-100 dark:border-slate-800 flex flex-col overflow-hidden mb-4"
          >
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={20} />
                <span className="font-bold">المساعد الذكي</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chat.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-4">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">أهلاً بك! كيف يمكنني مساعدتك في دراستك اليوم؟</p>
                </div>
              )}
              {chat.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none animate-pulse">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <input 
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="اسأل سؤالاً..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={handleSend}
                disabled={loading}
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 transition-all"
      >
        <Zap size={28} />
      </motion.button>
    </div>
  );
};

const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const dimensions = size === "sm" ? "w-8 h-8" : size === "md" ? "w-12 h-12" : "w-24 h-24";
  return (
    <div className="flex flex-col items-center">
      <div className={`${dimensions} relative flex items-center justify-center`}>
        <Star className="text-amber-400 w-full h-full" fill="currentColor" />
        <div className="absolute inset-0 flex items-center justify-center p-[20%]">
          <BookOpen className="text-indigo-600 dark:text-indigo-400 w-full h-full transition-colors duration-300" />
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ user, onLogout }: { user: User; onLogout: () => void }) => (
  <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 px-6 flex items-center justify-between transition-colors duration-300">
    <div className="flex items-center gap-2">
      <Logo size="sm" />
      <div className="flex items-center gap-0 font-display font-bold text-xl tracking-tight">
        <span className="text-amber-400">star</span>
        <span className="text-indigo-600 dark:text-indigo-400">Edu</span>
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      <div className="hidden md:flex flex-col items-start">
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.full_name}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role === 'admin' ? 'مسؤول' : user.role === 'teacher' ? 'معلم' : 'طالب'} {user.grade ? `• ${user.grade}` : ''}</span>
      </div>
      <button 
        onClick={() => {
          if (window.confirm('هل أنت متأكد من رغبتك في تسجيل الخروج؟')) {
            onLogout();
          }
        }}
        className="flex items-center gap-2 px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all rounded-lg font-medium"
      >
        <span className="text-sm hidden sm:inline">تسجيل الخروج</span>
        <LogOut size={18} />
      </button>
    </div>
  </nav>
);

const Sidebar = ({ activeTab, setActiveTab, user }: { activeTab: string; setActiveTab: (t: string) => void; user: User }) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, roles: ['student', 'teacher', 'admin'] },
    { id: 'leaderboard', label: 'المتصدرون', icon: Trophy, roles: ['student', 'teacher', 'admin'] },
    { 
      id: 'grades', 
      label: 'الصفوف الدراسية', 
      icon: GraduationCap, 
      roles: ['admin', 'teacher'],
      condition: (u: User) => u.role === 'admin' || (u.role === 'teacher' && (u.assigned_grades?.length || 0) > 1)
    },
    { id: 'subjects', label: 'موادي الدراسية', icon: BookOpen, roles: ['student', 'teacher', 'admin'] },
    { id: 'assignments', label: 'الواجبات', icon: FileUp, roles: ['student', 'teacher', 'admin'] },
    { id: 'exams', label: 'الامتحانات', icon: ClipboardList, roles: ['student', 'teacher', 'admin'] },
    { id: 'wallet', label: 'المحفظة والدفع', icon: Coins, roles: ['student', 'admin'] },
    { id: 'ai-chat', label: 'المساعد الذكي', icon: Sparkles, roles: ['student', 'teacher', 'admin'] },
    { id: 'chat', label: 'الرسائل', icon: MessageSquare, roles: ['student', 'teacher', 'admin'] },
    { id: 'profile', label: 'الملف الشخصي', icon: UserIcon, roles: ['student', 'teacher', 'admin'] },
    { id: 'settings', label: 'الإعدادات', icon: Settings, roles: ['student', 'teacher', 'admin'] },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users, roles: ['admin'] },
    { id: 'curriculum', label: 'المناهج الدراسية', icon: Settings, roles: ['admin', 'teacher'] },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles.includes(user.role)) return false;
    if (item.condition && !item.condition(user)) return false;
    return true;
  });

  return (
    <aside className="fixed right-0 top-16 bottom-0 w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 hidden lg:block transition-colors duration-300">
      <div className="space-y-1">
        {filteredMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full sidebar-item ${activeTab === item.id ? 'sidebar-item-active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div className="absolute bottom-4 left-4 right-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">بإشراف</p>
        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 text-center mt-1">شلال تاشي</p>
      </div>
    </aside>
  );
};

const BottomNav = ({ activeTab, setActiveTab, user }: { activeTab: string; setActiveTab: (t: string) => void; user: User }) => {
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, roles: ['student', 'teacher', 'admin'] },
    { id: 'subjects', label: 'المواد', icon: BookOpen, roles: ['student', 'teacher', 'admin'] },
    { id: 'wallet', label: 'المحفظة', icon: Coins, roles: ['student', 'admin'] },
    { id: 'assignments', label: 'الواجبات', icon: FileUp, roles: ['student', 'teacher', 'admin'] },
    { id: 'exams', label: 'الامتحانات', icon: ClipboardList, roles: ['student', 'teacher', 'admin'] },
    { id: 'ai-chat', label: 'المساعد', icon: Sparkles, roles: ['student', 'teacher', 'admin'] },
    { id: 'chat', label: 'الرسائل', icon: MessageSquare, roles: ['student', 'teacher', 'admin'] },
  ];

  const adminItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, roles: ['admin'] },
    { id: 'users', label: 'المستخدمين', icon: Users, roles: ['admin'] },
    { id: 'grades', label: 'الصفوف', icon: GraduationCap, roles: ['admin'] },
    { id: 'curriculum', label: 'المناهج', icon: Settings, roles: ['admin', 'teacher'] },
  ];

  const items = user.role === 'admin' ? adminItems : menuItems.filter(item => item.roles.includes(user.role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-1 flex items-center justify-around z-50 lg:hidden transition-colors duration-300">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            activeTab === item.id 
              ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <item.icon size={20} className={activeTab === item.id ? 'scale-110 transition-transform' : ''} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

// --- Assignment Components ---

const SubmissionModal = ({ assignment, user, onClose, onSuccess }: { assignment: Assignment, user: User, onClose: () => void, onSuccess: () => void }) => {
  const [textEntry, setTextEntry] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('assignmentId', assignment.id.toString());
    formData.append('userId', user.id.toString());
    formData.append('textEntry', textEntry);
    if (file) {
      formData.append('file', file);
    }

    try {
      const res = await fetch(getApiUrl('/api/submissions'), {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transition-colors duration-300"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">تسليم الواجب: {assignment.title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <Plus className="rotate-45" size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">النص (اختياري)</label>
            <textarea 
              value={textEntry}
              onChange={(e) => setTextEntry(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none min-h-[120px] text-right transition-colors duration-300"
              placeholder="اكتب إجابتك أو ملاحظاتك هنا..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">إرفاق ملف</label>
            <div className="relative">
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden" 
                id="file-upload"
              />
              <label 
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {file ? file.name : 'اضغط لرفع ملف أو اسحب وأفلت'}
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'جاري التسليم...' : 'تسليم الواجب'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AssignmentsView = ({ user }: { user: User }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [assignmentsRes, submissionsRes] = await Promise.all([
        fetch(getApiUrl(`/api/assignments/${user.grade}`)),
        fetch(getApiUrl(`/api/submissions/user/${user.id}`))
      ]);
      const [assignmentsData, submissionsData] = await Promise.all([
        assignmentsRes.json(),
        submissionsRes.json()
      ]);
      setAssignments(assignmentsData);
      setSubmissions(submissionsData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch assignments", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.grade, user.id]);

  const getSubmission = (assignmentId: number) => {
    return submissions.find(s => s.assignment_id === assignmentId);
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">الواجبات المنزلية</h2>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">تابع واجباتك وقم بتسليمها في الوقت المحدد.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.map((assignment) => {
          const submission = getSubmission(assignment.id);
          const isOverdue = new Date(assignment.due_date) < new Date() && !submission;

          return (
            <motion.div 
              key={assignment.id}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{assignment.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{assignment.subject_name}</p>
                  </div>
                </div>
                {submission ? (
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1">
                    <CheckCircle2 size={14} /> تم التسليم
                  </span>
                ) : isOverdue ? (
                  <span className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                    متأخر
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full">
                    قيد الانتظار
                  </span>
                )}
                {user.role === 'admin' && (
                  <button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      if(window.confirm('هل تريد حذف هذا الواجب؟')) {
                        await fetch(getApiUrl(`/api/admin/assignments/${assignment.id}`), { method: 'DELETE' });
                        fetchData();
                      }
                    }}
                    className="text-red-400 hover:text-red-600 dark:hover:text-red-400 p-1 mr-2"
                  >
                    حذف
                  </button>
                )}
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                {assignment.description}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-4 text-slate-500 text-xs font-medium">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>تاريخ الاستحقاق: {assignment.due_date}</span>
                  </div>
                </div>
                
                {!submission ? (
                  <button 
                    onClick={() => setSelectedAssignment(assignment)}
                    className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                  >
                    <Upload size={16} />
                    رفع الواجب
                  </button>
                ) : (
                  <div className="flex flex-col items-end gap-2">
                    {submission.file_url && (
                      <a 
                        href={getApiUrl(submission.file_url)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                      >
                        <Download size={12} /> عرض الملف المرفوع
                      </a>
                    )}
                    {submission.grade !== null && submission.grade !== undefined ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-500">الدرجة</span>
                        <span className="text-lg font-bold text-indigo-600">{submission.grade} / 100</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">في انتظار التقييم</span>
                    )}
                  </div>
                )}
              </div>
              
              {submission?.feedback && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-900 mb-1">ملاحظات المعلم:</p>
                  <p className="text-xs text-slate-600">{submission.feedback}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {selectedAssignment && (
        <SubmissionModal 
          assignment={selectedAssignment} 
          user={user} 
          onClose={() => setSelectedAssignment(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

// --- Views ---

const LoginView = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [grade, setGrade] = useState('السادس الإعدادي');
  const [section, setSection] = useState('أ');
  const [assignedGrades, setAssignedGrades] = useState<string[]>([]);
  const [assignedSections, setAssignedSections] = useState<string[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const grades = [
    'الخامس الابتدائي',
    'السادس الابتدائي',
    'الأول المتوسط',
    'الثاني المتوسط',
    'الثالث المتوسط',
    'الرابع الإعدادي',
    'الخامس الإعدادي',
    'السادس الإعدادي'
  ];

  const sections = ['أ', 'ب', 'ج', 'د', 'هـ'];

  const subjects = [
    'الرياضيات',
    'الفيزياء',
    'الكيمياء',
    'الأحياء',
    'اللغة العربية',
    'اللغة الإنجليزية',
    'التاريخ',
    'الجغرافيا',
    'التربية الإسلامية'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (isRegistering) {
      try {
        const res = await fetch(getApiUrl('/api/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: trimmedUsername, 
            password: trimmedPassword, 
            full_name: fullName, 
            grade: role === 'student' ? grade : null,
            section: role === 'student' ? section : null,
            assigned_grades: role === 'teacher' ? assignedGrades : null,
            assigned_sections: role === 'teacher' ? assignedSections : null,
            assigned_subjects: role === 'teacher' ? assignedSubjects : null,
            subject: role === 'teacher' ? assignedSubjects[0] : null,
            role
          })
        });
        const data = await res.json();
        if (data.success) {
          // Auto login after register
          const loginRes = await fetch(getApiUrl('/api/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword })
          });
          const loginData = await loginRes.json();
          if (loginData.success) {
            onLogin(loginData.user);
          }
        } else {
          setError(data.message || 'فشل إنشاء الحساب');
        }
      } catch (err) {
        setError('حدث خطأ أثناء التسجيل');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const res = await fetch(getApiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword })
        });
        const data = await res.json();
        if (data.success) {
          onLogin(data.user);
        } else {
          setError('بيانات الاعتماد غير صالحة');
        }
      } catch (err) {
        setError('حدث خطأ أثناء تسجيل الدخول');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleAssignedGrade = (g: string) => {
    if (assignedGrades.includes(g)) {
      setAssignedGrades(assignedGrades.filter(item => item !== g));
    } else {
      setAssignedGrades([...assignedGrades, g]);
    }
  };

  const toggleAssignedSection = (s: string) => {
    if (assignedSections.includes(s)) {
      setAssignedSections(assignedSections.filter(item => item !== s));
    } else {
      setAssignedSections([...assignedSections, s]);
    }
  };

  const toggleAssignedSubject = (s: string) => {
    if (assignedSubjects.includes(s)) {
      setAssignedSubjects(assignedSubjects.filter(item => item !== s));
    } else {
      setAssignedSubjects([...assignedSubjects, s]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8"
      >
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="flex items-center justify-center gap-0 font-display font-bold text-4xl mb-2">
            <span className="text-amber-400">star</span>
            <span className="text-indigo-600 dark:text-indigo-400">Edu</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {isRegistering ? 'إنشاء حساب جديد للبدء في رحلتك التعليمية' : 'مرحباً بك مجدداً! يرجى تسجيل الدخول إلى حسابك.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'student' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                >
                  طالب
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'teacher' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                >
                  معلم
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الاسم الكامل</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-right"
                  placeholder="أدخل اسمك الكامل"
                  required
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم المستخدم</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-right"
              placeholder="أدخل اسم المستخدم"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-right"
              placeholder="••••••••"
              required
            />
          </div>
          {isRegistering && role === 'student' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الصف الدراسي</label>
                <select 
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-right appearance-none"
                  required
                >
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الشعبة</label>
                <select 
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-right appearance-none"
                  required
                >
                  {sections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}
          {isRegistering && role === 'teacher' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">المواد الدراسية (يمكنك اختيار أكثر من مادة)</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {subjects.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleAssignedSubject(s)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${assignedSubjects.includes(s) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الصفوف الدراسية (يمكنك اختيار أكثر من صف)</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {grades.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleAssignedGrade(g)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${assignedGrades.includes(g) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الشعب الدراسية (يمكنك اختيار أكثر من شعبة)</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {sections.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleAssignedSection(s)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${assignedSections.includes(s) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full btn-primary mt-4 disabled:opacity-50">
            {loading ? 'جاري المعالجة...' : (isRegistering ? 'إنشاء حساب' : 'تسجيل الدخول')}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isRegistering ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}{' '}
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              {isRegistering ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const PaymentView = ({ user }: { user: User }) => {
  const [amount, setAmount] = useState('10000');
  const [method, setMethod] = useState<'zain_cash' | 'mastercard'>('zain_cash');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    const res = await fetch(getApiUrl(`/api/payments/history/${user.id}`));
    const data = await res.json();
    setHistory(data);
  };

  useEffect(() => {
    fetchHistory();
  }, [user.id]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/payments/initiate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount: parseInt(amount), method })
      });
      const data = await res.json();
      if (data.success) {
        // In a real app, redirect to data.redirectUrl
        // For simulation, we'll just show a success message and verify
        alert(`جاري توجيهك إلى بوابة ${method === 'zain_cash' ? 'زين كاش' : 'ماستر كارد'}...`);
        
        // Simulate callback after 2 seconds
        setTimeout(async () => {
          await fetch(getApiUrl('/api/payments/verify'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId: data.transactionId, status: 'completed' })
          });
          alert('تمت عملية الدفع بنجاح!');
          fetchHistory();
          setLoading(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">المحفظة والدفع الإلكتروني</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">اشحن رصيدك لتفعيل الدروس والخدمات المميزة.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold mb-6">شحن الرصيد</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">المبلغ (دينار عراقي)</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {['5000', '10000', '25000', '50000', '100000'].map(val => (
                    <button 
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`py-2 rounded-xl border transition-all ${amount === val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                    >
                      {parseInt(val).toLocaleString()} د.ع
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-right"
                  placeholder="أدخل مبلغاً مخصصاً"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">طريقة الدفع</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setMethod('zain_cash')}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${method === 'zain_cash' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-800'}`}
                  >
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">Zain</div>
                    <span className="font-bold text-sm">زين كاش</span>
                  </button>
                  <button 
                    onClick={() => setMethod('mastercard')}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${method === 'mastercard' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-800'}`}
                  >
                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-white">
                      <Coins size={24} />
                    </div>
                    <span className="font-bold text-sm">ماستر كارد</span>
                  </button>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {loading ? 'جاري المعالجة...' : `دفع ${parseInt(amount).toLocaleString()} د.ع`}
                <ChevronRight size={20} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-lg shadow-indigo-200 dark:shadow-none">
            <p className="text-indigo-100 text-sm mb-1">الرصيد الحالي</p>
            <h4 className="text-3xl font-bold">0 <span className="text-lg font-normal">د.ع</span></h4>
            <div className="mt-6 flex items-center gap-2 text-indigo-100 text-xs">
              <Zap size={14} />
              <span>اشحن رصيدك لتفعيل الدروس</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold mb-4">سجل العمليات</h4>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">لا توجد عمليات سابقة</p>
              ) : (
                history.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div>
                      <p className="text-xs font-bold">{item.method === 'zain_cash' ? 'زين كاش' : 'ماستر كارد'}</p>
                      <p className="text-[10px] text-slate-500">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${item.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {item.amount.toLocaleString()} د.ع
                      </p>
                      <p className="text-[10px] text-slate-400">{item.status === 'completed' ? 'ناجحة' : 'قيد الانتظار'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoogleDrivePicker = ({ user, onSelect }: { user: User; onSelect: (file: any) => void }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl(`/api/google/drive/files?userId=${user.id}`));
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to fetch files');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const res = await fetch(getApiUrl('/api/auth/google/drive/url'));
      const { url } = await res.json();
      window.open(url, 'google_drive_auth', 'width=600,height=700');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_DRIVE_AUTH_SUCCESS') {
        fetchFiles();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
            <Link size={18} />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100">Google Drive</h4>
        </div>
        {error ? (
          <button 
            onClick={handleConnect}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            ربط الحساب
          </button>
        ) : (
          <button 
            onClick={fetchFiles}
            className="text-xs font-bold text-slate-500 hover:text-indigo-600"
          >
            تحديث القائمة
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <p className="text-xs text-slate-500 text-center py-2">{error === 'Google Drive not connected' ? 'قم بربط حسابك للوصول إلى ملفاتك' : error}</p>
      ) : files.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-2">لا توجد ملفات متاحة.</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {files.map((file) => (
            <div 
              key={file.id}
              onClick={() => onSelect(file)}
              className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group"
            >
              <img src={file.iconLink} alt="" className="w-4 h-4" referrerPolicy="no-referrer" />
              <span className="text-xs text-slate-700 dark:text-slate-300 truncate flex-1">{file.name}</span>
              <Plus size={14} className="text-slate-300 group-hover:text-indigo-600" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SettingsView = ({ user }: { user: User }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: localStorage.getItem('theme') === 'dark',
    language: 'ar',
    emailUpdates: true,
  });

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm transition-colors duration-300">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8 flex items-center gap-3">
          <Settings className="text-indigo-600" size={28} /> إعدادات الحساب
        </h2>
        
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">التنبيهات</p>
              <p className="text-xs text-slate-500">تلقي تنبيهات بخصوص الواجبات والامتحانات</p>
            </div>
            <button 
              onClick={() => setSettings({...settings, notifications: !settings.notifications})}
              className={`w-12 h-6 rounded-full transition-all relative ${settings.notifications ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.notifications ? 'right-7' : 'right-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">تحديثات البريد الإلكتروني</p>
              <p className="text-xs text-slate-500">تلقي تقارير أسبوعية عن التقدم الدراسي</p>
            </div>
            <button 
              onClick={() => setSettings({...settings, emailUpdates: !settings.emailUpdates})}
              className={`w-12 h-6 rounded-full transition-all relative ${settings.emailUpdates ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.emailUpdates ? 'right-7' : 'right-1'}`} />
            </button>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">اللغة</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 font-bold text-sm">العربية</button>
              <button className="p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-400 font-bold text-sm">English</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm transition-colors duration-300">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <Link size={24} className="text-blue-600" />
          الخدمات السحابية
        </h3>
        <p className="text-sm text-slate-500 mb-6">اربط حسابك في Google Drive للوصول السريع إلى ملفاتك ومشاركتها.</p>
        <GoogleDrivePicker user={user} onSelect={(file) => console.log('Selected file:', file)} />
      </div>
    </div>
  );
};

const ProfileView = ({ user }: { user: User }) => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300">
        <div className="h-48 bg-gradient-to-r from-indigo-600 to-violet-600 relative">
          <div className="absolute -bottom-16 right-12">
            <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-slate-900 p-2 shadow-xl">
              <div className="w-full h-full rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <UserIcon size={48} />
              </div>
            </div>
          </div>
        </div>
        <div className="pt-20 pb-12 px-12">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{user.full_name}</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{user.email}</p>
              <div className="flex items-center gap-4 mt-4">
                <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                  {user.role === 'admin' ? 'مسؤول النظام' : user.role === 'teacher' ? 'معلم' : 'طالب'}
                </span>
                <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-800">
                  {user.grade || 'غير محدد'}
                </span>
              </div>
            </div>
            <button className="btn-secondary flex items-center gap-2">
              <Settings size={18} /> تعديل الملف الشخصي
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 font-bold mb-1">تاريخ الانضمام</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">سبتمبر 2023</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 font-bold mb-1">المواد المسجلة</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">8 مواد</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 font-bold mb-1">الدروس المكتملة</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">124 درس</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GradeContentWidget = ({ grade }: { grade: string }) => {
  const [content, setContent] = useState<any[]>([]);
  
  useEffect(() => {
    fetch(`/api/grade-content/${grade}`).then(res => res.json()).then(setContent);
  }, [grade]);

  if (content.length === 0) return null;

  return (
    <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <GraduationCap className="text-indigo-600" size={24} /> مصادر الصف {grade}
        </h3>
        <button className="text-xs font-bold text-indigo-600 hover:underline">عرض الكل</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {content.slice(0, 3).map((item) => (
          <div key={item.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl text-indigo-600 shadow-sm">
                {item.type === 'video' ? <PlayCircle size={18} /> : <FileText size={18} />}
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
            </div>
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 bg-white dark:bg-slate-900 text-indigo-600 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-indigo-600 hover:text-white transition-all"
            >
              فتح المصدر <ChevronRight size={14} className="transform rotate-180" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

const QuickNotesWidget = () => {
  const [note, setNote] = useState('');
  
  return (
    <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
        <StickyNote className="text-indigo-500" size={24} /> ملاحظات سريعة
      </h3>
      <textarea 
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="اكتب ملاحظة سريعة هنا..."
        className="w-full h-32 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
      />
      <div className="mt-4 flex justify-end">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all">حفظ الملاحظة</button>
      </div>
    </section>
  );
};

const FlashcardsWidget = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const cards = [
    { question: 'ما هو تعريف الخلية؟', answer: 'الوحدة الأساسية للحياة في الكائنات الحية.' },
    { question: 'من هو مؤسس علم الجبر؟', answer: 'الخوارزمي.' },
    { question: 'ما هي عاصمة العراق؟', answer: 'بغداد.' },
  ];

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((currentIndex + 1) % cards.length);
    }, 150);
  };

  return (
    <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Brain className="text-emerald-500" size={24} /> بطاقات المراجعة
        </h3>
        <span className="text-xs font-bold text-slate-500">{currentIndex + 1} / {cards.length}</span>
      </div>
      
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="h-48 w-full perspective-1000 cursor-pointer group"
      >
        <motion.div 
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          className="relative w-full h-full preserve-3d"
        >
          <div className="absolute inset-0 backface-hidden bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-center p-6 text-center">
            <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{cards[currentIndex].question}</p>
          </div>
          <div className="absolute inset-0 backface-hidden bg-indigo-600 rounded-3xl flex items-center justify-center p-6 text-center [transform:rotateY(180deg)]">
            <p className="text-lg font-bold text-white">{cards[currentIndex].answer}</p>
          </div>
        </motion.div>
      </div>
      
      <div className="mt-6 flex justify-center">
        <button 
          onClick={(e) => { e.stopPropagation(); nextCard(); }}
          className="flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 transition-all"
        >
          البطاقة التالية <ChevronRight size={18} className="transform rotate-180" />
        </button>
      </div>
    </section>
  );
};

const DailyChallenges = () => {
  const challenges = [
    { title: 'حل اختبار سريع', reward: '50 XP', icon: ClipboardList, completed: true },
    { title: 'مشاهدة فيديو تعليمي', reward: '30 XP', icon: PlayCircle, completed: false },
    { title: 'كتابة ملاحظة دراسية', reward: '20 XP', icon: FileText, completed: false },
    { title: 'تحقيق درجة 90% في امتحان', reward: '100 XP', icon: Award, completed: false },
  ];

  return (
    <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
        <Zap className="text-amber-500" size={24} /> تحديات اليوم
      </h3>
      <div className="space-y-4">
        {challenges.map((challenge, index) => (
          <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${challenge.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-white dark:bg-slate-900 text-slate-400'}`}>
                <challenge.icon size={20} />
              </div>
              <div>
                <p className={`text-sm font-bold ${challenge.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'}`}>{challenge.title}</p>
                <p className="text-[10px] text-amber-600 font-bold">{challenge.reward}</p>
              </div>
            </div>
            {challenge.completed ? (
              <CheckCircle2 className="text-emerald-500" size={20} />
            ) : (
              <button className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-all">انطلق</button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const StudyTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Timer className="text-indigo-600" size={20} /> مؤقت الدراسة
        </h3>
        {isActive && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 bg-red-500 rounded-full"
          />
        )}
      </div>
      <div className="text-center mb-6">
        <div className="text-4xl font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {formatTime(seconds)}
        </div>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
            isActive 
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none'
          }`}
        >
          {isActive ? 'إيقاف مؤقت' : 'ابدأ الدراسة'}
        </button>
        <button 
          onClick={() => { setIsActive(false); setSeconds(0); }}
          className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-200 transition-all"
        >
          <Plus className="rotate-45" size={20} />
        </button>
      </div>
    </section>
  );
};

const RewardsStore = ({ user, stats, onPurchase }: { user: User, stats: UserStats, onPurchase: () => void }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [purchasedRewards, setPurchasedRewards] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [rewardsRes, userRewardsRes] = await Promise.all([
        fetch(getApiUrl('/api/rewards')),
        fetch(getApiUrl(`/api/rewards/user/${user.id}`))
      ]);
      const rewardsData = await rewardsRes.json();
      const userRewardsData = await userRewardsRes.json();
      setRewards(rewardsData);
      setPurchasedRewards(userRewardsData.map((r: any) => r.id));
      setLoading(false);
    };
    fetchData();
  }, [user.id]);

  const handlePurchase = async (reward: Reward) => {
    if (stats.coins < reward.cost) {
      alert('ليس لديك عملات كافية!');
      return;
    }
    const res = await fetch(getApiUrl('/api/rewards/purchase'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, rewardId: reward.id })
    });
    if (res.ok) {
      setPurchasedRewards([...purchasedRewards, reward.id]);
      onPurchase();
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShoppingBag className="text-amber-500" size={24} /> متجر المكافآت
        </h3>
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full text-amber-600 dark:text-amber-400 font-bold text-sm">
          <Coins size={16} /> {stats.coins} عملة
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rewards.map((reward) => (
          <div key={reward.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex flex-col justify-between group transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
                <Sparkles size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{reward.name}</p>
                <p className="text-[10px] text-slate-500 line-clamp-2">{reward.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Coins size={12} /> {reward.cost}
              </span>
              <button 
                onClick={() => handlePurchase(reward)}
                disabled={purchasedRewards.includes(reward.id)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  purchasedRewards.includes(reward.id) 
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {purchasedRewards.includes(reward.id) ? 'تم الشراء' : 'شراء'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const QuickActions = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const actions = [
    { label: 'مؤقت الدراسة', icon: Timer, color: 'text-indigo-600', bg: 'bg-indigo-50', tab: 'dashboard' },
    { label: 'بطاقات تعليمية', icon: Brain, color: 'text-emerald-600', bg: 'bg-emerald-50', tab: 'subjects' },
    { label: 'مخطط الجدول', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', tab: 'assignments' },
    { label: 'المكتبة الرقمية', icon: BookOpen, color: 'text-rose-600', bg: 'bg-rose-50', tab: 'subjects' },
    { label: 'تحديات جماعية', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50', tab: 'leaderboard' },
    { label: 'تقارير الأداء', icon: TrendingUp, color: 'text-sky-600', bg: 'bg-sky-50', tab: 'grades' },
    { label: 'ملاحظات سريعة', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50', tab: 'profile' },
    { label: 'الذكاء الاصطناعي', icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-50', tab: 'ai-chat' },
  ];

  return (
    <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-8">إجراءات سريعة</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.button 
            key={index}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(action.tab)}
            className={`flex flex-col items-center justify-center p-6 rounded-[2rem] ${action.bg} dark:bg-slate-800/50 transition-all group`}
          >
            <div className={`p-3 rounded-2xl bg-white dark:bg-slate-900 ${action.color} shadow-sm mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-all`}>
              <action.icon size={24} />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

const StudentDashboard = ({ user, setActiveTab }: { user: User, setActiveTab: (tab: string) => void }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [progress, setProgress] = useState<SubjectProgress[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteLessons, setFavoriteLessons] = useState<any[]>([]);

  const categories = [
    { id: 'textbooks', label: 'الكتب الدراسية', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'videos', label: 'الشرح الفيديوي', icon: PlayCircle, color: 'bg-red-500' },
    { id: 'summaries', label: 'الملازم', icon: FileText, color: 'bg-emerald-500' },
    { id: 'exams', label: 'الامتحانات', icon: ClipboardList, color: 'bg-amber-500' }
  ];

  const fetchData = async () => {
    try {
      const [subjectsRes, statsRes, progressRes, recsRes, favsRes] = await Promise.all([
        fetch(getApiUrl(`/api/subjects/${user.grade}`)),
        fetch(getApiUrl(`/api/gamification/stats/${user.id}`)),
        fetch(getApiUrl(`/api/subjects/progress/${user.id}/${user.grade}`)),
        fetch(getApiUrl(`/api/recommendations/${user.id}`)),
        fetch(getApiUrl(`/api/gamification/favorites/${user.id}`))
      ]);
      
      const [subjectsData, statsData, progressData, recsData, favsData] = await Promise.all([
        subjectsRes.json(),
        statsRes.json(),
        progressRes.json(),
        recsRes.json(),
        favsRes.json()
      ]);

      setSubjects(subjectsData);
      setStats(statsData);
      setProgress(progressData);
      setRecommendations(recsData);
      setFavoriteLessons(favsData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id, user.grade]);

  const generateRecommendations = async () => {
    setGenerating(true);
    try {
      const res = await fetch(getApiUrl('/api/recommendations/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error("Failed to generate recommendations", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">أهلاً بك، {user.full_name} 👋</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">أنت مسجل في {user.grade}. استمر في التقدم والتعلم.</p>
        </div>
        <div className="flex items-center gap-4">
          {stats && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Star size={20} fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">نقاطك</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">{stats.points}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/10 rounded-full flex items-center justify-center text-amber-500">
                  <Coins size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">عملاتك</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">{stats.coins}</p>
                </div>
              </div>
            </div>
          )}
          <div className="relative max-w-md w-full hidden md:block">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="ابحث عن دروس..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <BookOpen size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">المواد النشطة</span>
          </div>
          <div className="text-4xl font-bold">{subjects.length}</div>
          <p className="text-sm mt-2 opacity-80">استمر في العمل الرائع!</p>
        </div>
        
        <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <Zap size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">الدروس المكتملة</span>
          </div>
          <div className="text-4xl font-bold">{stats?.lessonsCompleted || 0}</div>
          <p className="text-sm mt-2 opacity-80">أكمل المزيد لربح النقاط</p>
        </div>

        <div className="bg-amber-500 rounded-3xl p-6 text-white shadow-xl shadow-amber-100 dark:shadow-amber-900/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <Award size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">الأوسمة</span>
          </div>
          <div className="text-4xl font-bold">{stats?.badges.length || 0}</div>
          <p className="text-sm mt-2 opacity-80">أوسمة الإنجاز الخاصة بك</p>
        </div>

        <div className="bg-rose-500 rounded-3xl p-6 text-white shadow-xl shadow-rose-100 dark:shadow-rose-900/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">المستوى</span>
          </div>
          <div className="text-4xl font-bold">{stats?.level || 1}</div>
          <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
            <div 
              className="bg-white h-1.5 rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min(100, ((stats?.xp || 0) / (stats?.nextLevelXp || 1000)) * 100)}%` }} 
            />
          </div>
          <p className="text-[10px] mt-1 opacity-80">{stats?.xp} / {stats?.nextLevelXp} XP</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">المحتوى الدراسي لصفك</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTab('grades');
                  }}
                  className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all flex flex-col items-center text-center group"
                >
                  <div className={`w-12 h-12 ${cat.color} rounded-2xl flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                    <cat.icon size={24} />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>
          
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">تقدمك في المواد</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {progress.map((item) => (
                <motion.div 
                  key={item.subjectId}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.subjectName}</h4>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      className="h-full bg-indigo-600 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    أكملت {item.completed} من أصل {item.total} درساً
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">موادك الدراسية</h3>
              <button className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline">عرض الكل</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {subjects.map((subject) => (
                <motion.div 
                  key={subject.id}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 mb-4 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <BookOpen size={24} />
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{subject.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">الصف: {subject.grade}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700" />
                      ))}
                    </div>
                    <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors transform rotate-180" />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Heart className="text-rose-500" size={24} fill="currentColor" /> دروسك المفضلة
              </h3>
              <span className="text-xs font-bold text-slate-500">{favoriteLessons.length} درس</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favoriteLessons.length === 0 ? (
                <div className="col-span-2 text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Heart size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                  <p className="text-sm text-slate-500">لا توجد دروس في المفضلة بعد.</p>
                </div>
              ) : (
                favoriteLessons.map((fav) => (
                  <div key={fav.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-rose-200 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
                        <PlayCircle size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{fav.lesson_title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{fav.subject_name}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-rose-500 transition-colors transform rotate-180 shrink-0" />
                  </div>
                ))
              )}
            </div>
          </section>

          <GradeContentWidget grade={user.grade || 'السادس الإعدادي'} />

          <FlashcardsWidget />

          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">توصيات مخصصة لك</h3>
                </div>
              </div>
              <button 
                onClick={generateRecommendations}
                disabled={generating}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all disabled:opacity-50"
              >
                {generating ? 'جاري التحليل...' : 'تحديث التوصيات'}
              </button>
            </div>

            <div className="space-y-4">
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mx-auto mb-3">
                    <TrendingUp size={32} />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">اضغط على "تحديث التوصيات" للحصول على مسار تعلم مخصص.</p>
                </div>
              ) : (
                recommendations.map((rec) => (
                  <motion.div 
                    key={rec.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 
                      rec.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 
                      'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {rec.content_type === 'lesson' ? <PlayCircle size={20} /> : <ClipboardList size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100">{rec.title}</h4>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 
                          rec.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 
                          'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                        }`}>
                          {rec.priority === 'high' ? 'أولوية عالية' : rec.priority === 'medium' ? 'متوسط' : 'عادي'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{rec.reason}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {stats && <RewardsStore user={user} stats={stats} onPurchase={fetchData} />}
        </div>

        <div className="space-y-8">
          <StudyTimer />
          <DailyChallenges />
          <QuickNotesWidget />
          {stats && (
            <section className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                    المستوى {stats.level}
                  </div>
                  <div className="flex items-center gap-1 text-amber-300 font-bold">
                    <Zap size={16} fill="currentColor" /> {stats.streak} يوم
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-indigo-100 text-sm mb-1">نقاط الخبرة (XP)</p>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-2xl font-bold">{stats.xp}</span>
                    <span className="text-indigo-200 text-xs">/ {stats.nextLevelXp}</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                    <p className="text-[10px] text-indigo-200">الدروس المكتملة</p>
                    <p className="text-lg font-bold">{stats.lessonsCompleted}</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                    <p className="text-[10px] text-indigo-200">العملات</p>
                    <p className="text-lg font-bold">{stats.coins}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-indigo-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="text-indigo-600" size={24} /> نشاطك الأسبوعي
                </h3>
              </div>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.weeklyActivity || []}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 10 }}
                    tickFormatter={(val) => new Date(val).toLocaleDateString('ar-EG', { weekday: 'short' })}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#4F46E5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Award className="text-amber-500" size={20} /> أوسمتك
            </h3>
            {stats?.badges.length === 0 ? (
              <div className="text-center py-8">
                <Award size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">لم تحصل على أوسمة بعد. ابدأ التعلم الآن!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {stats?.badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center text-amber-500 mb-2">
                      {badge.icon === 'Star' ? <Star size={24} fill="currentColor" /> : 
                       badge.icon === 'Award' ? <Award size={24} /> : 
                       badge.icon === 'Zap' ? <Zap size={24} fill="currentColor" /> :
                       <BookOpen size={24} />}
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{badge.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">{badge.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">دروسك المفضلة</h3>
              <Heart className="text-rose-500" size={24} fill="currentColor" />
            </div>
            <div className="space-y-4">
              {favoriteLessons.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Heart size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                  <p className="text-sm text-slate-500">لا توجد دروس في المفضلة بعد.</p>
                </div>
              ) : (
                favoriteLessons.map((fav) => (
                  <div key={fav.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-rose-200 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
                        <PlayCircle size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{fav.lesson_title}</p>
                        <p className="text-[10px] text-slate-500">{fav.subject_name}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-rose-500 transition-colors transform rotate-180" />
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-indigo-900 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-950/50 overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">تحدي الأسبوع</h3>
              <p className="text-sm opacity-80 mb-6">أكمل 3 امتحانات بتقدير ممتاز لتربح 200 نقطة إضافية!</p>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-white rounded-full w-1/3 transition-all duration-1000" />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs opacity-60">1 من أصل 3 مكتمل</p>
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">33%</span>
              </div>
            </div>
            <TrendingUp size={160} className="absolute -bottom-10 -right-10 text-white/5 group-hover:scale-110 transition-transform duration-700" />
          </section>

          <section className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">إجراءات سريعة</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all group">
                <MessageSquare size={24} className="mb-2" />
                <span className="text-xs font-bold">تواصل مع المعلم</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all group">
                <ClipboardList size={24} className="mb-2" />
                <span className="text-xs font-bold">الامتحانات القادمة</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl hover:bg-amber-600 hover:text-white transition-all group">
                <Trophy size={24} className="mb-2" />
                <span className="text-xs font-bold">لوحة المتصدرين</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl hover:bg-rose-600 hover:text-white transition-all group">
                <Settings size={24} className="mb-2" />
                <span className="text-xs font-bold">الإعدادات</span>
              </button>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">مهام قادمة</h3>
              <span className="text-xs text-indigo-600 font-bold cursor-pointer hover:underline">عرض الكل</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer group">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">تقرير الفيزياء</p>
                  <p className="text-[10px] text-slate-500">غداً، 10:00 ص</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer group">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">اختبار الرياضيات</p>
                  <p className="text-[10px] text-slate-500">الخميس، 12:30 م</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <StudyAssistant user={user} />
    </div>
  );
};

const LeaderboardView = ({ user }: { user: User }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl(`/api/gamification/leaderboard/${user.grade}`))
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data);
        setLoading(false);
      });
  }, [user.grade]);

  return (
    <div className="space-y-8">
      <header className="text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-100 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-6 shadow-lg shadow-amber-50 dark:shadow-amber-900/20 transition-colors duration-300">
          <Trophy size={32} className="md:w-10 md:h-10" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">لوحة المتصدرين</h2>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-2 transition-colors duration-300">تعرف على الطلاب الأكثر تميزاً في {user.grade}. هل يمكنك الوصول إلى القمة؟</p>
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl transition-colors duration-300">
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">الترتيب</span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">الطالب</span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">النقاط</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {leaderboard.map((entry, index) => (
              <motion.div 
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all ${entry.id === user.id ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' :
                    index === 1 ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' :
                    index === 2 ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' :
                    'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{entry.full_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{entry.grade}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{entry.points}</span>
                  <Star size={16} className="text-amber-500" fill="currentColor" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AIChatView = ({ user }: { user: User }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: `مرحباً ${user.full_name}! أنا مساعدك الذكي. كيف يمكنني مساعدتك في دراستك اليوم؟` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: [...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: "أنت مساعد تعليمي ذكي لمنصة starEdu بإشراف شلال تاشي. ساعد الطلاب في فهم المواد الدراسية، حل المسائل، وتقديم نصائح دراسية. كن ودوداً ومشجعاً. أجب باللغة العربية دائماً.",
        }
      });

      const aiResponse = response.text || "عذراً، لم أتمكن من معالجة طلبك حالياً.";
      setMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl transition-colors duration-300">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">المساعد الذكي</h3>
            <p className="text-xs opacity-80">مدعوم بتقنيات الذكاء الاصطناعي</p>
          </div>
        </div>
        <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">
          متصل الآن
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-900/30">
        {messages.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[85%] p-5 rounded-3xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tl-none' 
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tr-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl rounded-tr-none border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex gap-1">
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-3">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اسألني أي شيء عن دروسك..."
          disabled={loading}
          className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-right transition-all disabled:opacity-50"
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50 disabled:grayscale"
        >
          <Send size={24} className="transform rotate-180" />
        </button>
      </form>
    </div>
  );
};

const ChatView = ({ user }: { user: User }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetch(getApiUrl(`/api/messages/${user.id}`))
      .then(res => res.json())
      .then(setMessages);
  }, [user.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const res = await fetch(getApiUrl('/api/messages'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: user.id,
        receiverId: 1, // Defaulting to admin/teacher for demo
        content: newMessage
      })
    });

    if (res.ok) {
      setMessages([...messages, { 
        id: Date.now(), 
        sender_id: user.id, 
        receiver_id: 1, 
        content: newMessage, 
        created_at: new Date().toISOString(),
        sender_name: user.full_name
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Users size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100">الدعم العام</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">اسأل معلميك أي شيء</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender_id === user.id ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[70%] p-4 rounded-2xl ${
              msg.sender_id === user.id 
                ? 'bg-indigo-600 text-white rounded-tl-none' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tr-none'
            }`}>
              <p className="text-sm">{msg.content}</p>
              <span className={`text-[10px] mt-1 block opacity-60 ${msg.sender_id === user.id ? 'text-left' : 'text-right'}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="اكتب رسالتك هنا..."
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-right transition-colors duration-300"
        />
        <button type="submit" className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
          <Send size={20} className="transform rotate-180" />
        </button>
      </form>
    </div>
  );
};

const ExamView = ({ user, exam, onComplete, onCancel }: { user: User, exam: Exam, onComplete: (score: number, total: number) => void, onCancel: () => void }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/exam-questions/${exam.id}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setLoading(false);
      });
  }, [exam.id]);

  const handleSubmit = async () => {
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        score++;
      }
    });

    const res = await fetch(getApiUrl('/api/exams/submit'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        examId: exam.id,
        score,
        total: questions.length
      })
    });

    if (res.ok) {
      const data = await res.json();
      setSubmitted(true);
      onComplete(score, questions.length);
    }
  };

  if (loading) return <div className="py-20 text-center">جاري تحميل الأسئلة...</div>;
  if (questions.length === 0) return <div className="py-20 text-center">لا توجد أسئلة لهذا الامتحان.</div>;

  if (submitted) {
    const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct_answer ? 1 : 0), 0);
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-lg">
          <CheckCircle2 size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">تم إكمال الامتحان بنجاح!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">لقد حصلت على {score} من أصل {questions.length}</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
          <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">لقد ربحت {50 + Math.floor((score / questions.length) * 50)} نقطة!</p>
        </div>
        <button onClick={onCancel} className="btn-primary w-full">العودة للمادة</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{exam.title}</h2>
          <p className="text-slate-500 dark:text-slate-400">السؤال {currentQuestionIndex + 1} من {questions.length}</p>
        </div>
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono font-bold text-slate-600 dark:text-slate-400">
          {exam.duration}:00
        </div>
      </header>

      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-600 transition-all duration-300" 
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <motion.div 
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-8">{currentQuestion.question_text}</h3>
        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setAnswers({ ...answers, [currentQuestion.id]: option })}
              className={`w-full p-4 rounded-2xl border-2 text-right transition-all font-medium ${
                answers[currentQuestion.id] === option 
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                  : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="flex items-center justify-between">
        <button 
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="btn-secondary disabled:opacity-50"
        >
          السابق
        </button>
        {currentQuestionIndex === questions.length - 1 ? (
          <button 
            onClick={handleSubmit}
            disabled={!answers[currentQuestion.id]}
            className="btn-primary"
          >
            إنهاء الامتحان
          </button>
        ) : (
          <button 
            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={!answers[currentQuestion.id]}
            className="btn-primary"
          >
            التالي
          </button>
        )}
      </div>
    </div>
  );
};

const SubjectDetailView = ({ user, subject, onBack }: { user: User, subject: Subject, onBack: () => void }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    fetch(`/api/gamification/favorites/${user.id}`)
      .then(res => res.json())
      .then(data => setFavorites(data.map((f: any) => f.lesson_id)));
  }, [user.id]);

  const toggleFavorite = async (lessonId: number) => {
    const isFavorite = favorites.includes(lessonId);
    const method = isFavorite ? 'DELETE' : 'POST';
    
    try {
      await fetch(getApiUrl('/api/gamification/favorites'), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, lessonId })
      });
      
      if (isFavorite) {
        setFavorites(favorites.filter(id => id !== lessonId));
      } else {
        setFavorites([...favorites, lessonId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const [lessonsRes, examsRes] = await Promise.all([
        fetch(getApiUrl(`/api/lessons/${subject.id}`)),
        fetch(getApiUrl(`/api/exams/${subject.id}`))
      ]);
      const [lessonsData, examsData] = await Promise.all([
        lessonsRes.json(),
        examsRes.json()
      ]);
      setLessons(lessonsData);
      setExams(examsData);
      setLoading(false);
    };
    fetchData();
  }, [subject.id]);

  useEffect(() => {
    if (selectedLesson) {
      fetch(getApiUrl(`/api/notes/${user.id}/${selectedLesson.id}`))
        .then(res => res.json())
        .then(data => setNote(data.content));
    }
  }, [selectedLesson, user.id]);

  const handleSaveNote = async () => {
    if (!selectedLesson) return;
    setSavingNote(true);
    try {
      await fetch(getApiUrl('/api/notes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, lessonId: selectedLesson.id, content: note })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleCompleteLesson = async (lessonId: number) => {
    const res = await fetch(getApiUrl('/api/gamification/complete-lesson'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, lessonId })
    });
    if (res.ok) {
      setCompletedLessons([...completedLessons, lessonId]);
      alert('أحسنت! لقد حصلت على 20 نقطة.');
    }
  };

  if (activeExam) {
    return <ExamView user={user} exam={activeExam} onComplete={() => {}} onCancel={() => setActiveExam(null)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          <ChevronRight size={20} /> العودة للمواد
        </button>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <BookOpen size={18} />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{subject.name}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PlayCircle className="text-indigo-600" /> الدروس المتاحة
              </h3>
              <span className="text-xs font-bold text-slate-500">{lessons.length} درس</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {lessons.length === 0 ? (
                <div className="p-12 text-center">
                  <PlayCircle size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                  <p className="text-slate-500">لا توجد دروس مضافة بعد.</p>
                </div>
              ) : (
                lessons.map((lesson) => (
                  <div 
                    key={lesson.id} 
                    onClick={() => setSelectedLesson(lesson)}
                    className={`p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer ${selectedLesson?.id === lesson.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        lesson.type === 'video' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' :
                        lesson.type === 'pdf' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' :
                        'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                      }`}>
                        {lesson.type === 'video' ? <PlayCircle size={24} /> : 
                         lesson.type === 'pdf' ? <FileText size={24} /> : 
                         <BookOpen size={24} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 capitalize">{lesson.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(lesson.id); }}
                        className={`p-2 rounded-xl transition-all ${
                          favorites.includes(lesson.id) 
                            ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' 
                            : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                        }`}
                        title={favorites.includes(lesson.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                      >
                        <Heart size={20} fill={favorites.includes(lesson.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const url = lesson.url.startsWith('http') ? lesson.url : getApiUrl(lesson.url);
                          window.open(url, '_blank'); 
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                        title="عرض المحتوى"
                      >
                        <Eye size={20} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCompleteLesson(lesson.id); }}
                        disabled={completedLessons.includes(lesson.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          completedLessons.includes(lesson.id)
                            ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 cursor-default'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                        }`}
                      >
                        {completedLessons.includes(lesson.id) ? 'مكتمل ✓' : 'إكمال الدرس'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ClipboardList className="text-amber-500" /> الامتحانات التقويمية
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exams.length === 0 ? (
                <div className="col-span-2 p-12 text-center">
                  <ClipboardList size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                  <p className="text-slate-500">لا توجد امتحانات مضافة بعد.</p>
                </div>
              ) : (
                exams.map((exam) => (
                  <div key={exam.id} className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-200 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
                        <ClipboardList size={20} />
                      </div>
                      <span className="text-xs font-bold text-slate-500">{exam.duration} دقيقة</span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-6">{exam.title}</h4>
                    <button 
                      onClick={() => setActiveExam(exam)}
                      className="w-full py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                    >
                      بدء الامتحان
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="text-indigo-600" /> ملاحظاتك الدراسية
              </h3>
              {savingNote && <span className="text-[10px] text-indigo-600 animate-pulse">جاري الحفظ...</span>}
            </div>
            
            {!selectedLesson ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                  <FileText size={32} />
                </div>
                <p className="text-sm text-slate-500">اختر درساً من القائمة للبدء في تدوين ملاحظاتك.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">ملاحظات لـ: {selectedLesson.title}</p>
                </div>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={handleSaveNote}
                  placeholder="اكتب ملاحظاتك هنا... سيتم حفظها تلقائياً عند الخروج."
                  className="w-full h-64 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
                <button 
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  {savingNote ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
      <StudyAssistant user={user} context={selectedLesson ? `I am studying the lesson: ${selectedLesson.title} in the subject: ${subject.name}` : `I am studying the subject: ${subject.name}`} />
    </div>
  );
};

const SubjectsView = ({ user }: { user: User }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`/api/subjects/${user.grade}`)
      .then(res => res.json())
      .then(data => {
        setSubjects(data);
        setLoading(false);
      });
  }, [user.grade]);

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedSubject) {
    return <SubjectDetailView user={user} subject={selectedSubject} onBack={() => setSelectedSubject(null)} />;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">موادي الدراسية</h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">اختر مادة للبدء في التعلم وجمع النقاط.</p>
        </div>
        <div className="relative max-w-md w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="ابحث عن مادة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
          />
        </div>
      </header>
      
      {filteredSubjects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800">
          <Search size={64} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
          <p className="text-slate-500">لم يتم العثور على نتائج لبحثك.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => (
          <motion.div 
            key={subject.id}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedSubject(subject)}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <BookOpen size={32} />
            </div>
            <h4 className="font-bold text-xl text-slate-900 dark:text-slate-100">{subject.name}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">استكشف المنهج والامتحانات</p>
            <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">ابدأ الآن</span>
              <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors transform rotate-180" />
            </div>
          </motion.div>
        ))}
      </div>
      )}
    </div>
  );
};

const AdminUsersView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'student' as Role,
    grade: '',
    section: '',
    assigned_grades: [] as string[],
    assigned_sections: [] as string[],
    assigned_subjects: [] as string[]
  });

  const grades = [
    'الخامس الابتدائي',
    'السادس الابتدائي',
    'الأول المتوسط',
    'الثاني المتوسط',
    'الثالث المتوسط',
    'الرابع الإعدادي',
    'الخامس الإعدادي',
    'السادس الإعدادي'
  ];

  const sections = ['أ', 'ب', 'ج', 'د', 'هـ'];

  const subjects = [
    'الرياضيات',
    'الفيزياء',
    'الكيمياء',
    'الأحياء',
    'اللغة العربية',
    'اللغة الإنجليزية',
    'التاريخ',
    'الجغرافيا',
    'التربية الإسلامية'
  ];

  const fetchUsers = () => {
    fetch(getApiUrl('/api/admin/users')).then(res => res.json()).then(setUsers);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      await fetch(getApiUrl(`/api/admin/users/${id}`), { method: 'DELETE' });
      fetchUsers();
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', 
      full_name: user.full_name,
      role: user.role,
      grade: user.grade || '',
      section: user.section || '',
      assigned_grades: user.assigned_grades || [],
      assigned_sections: user.assigned_sections || [],
      assigned_subjects: user.assigned_subjects || []
    });
    setShowAdd(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
    const method = editingUser ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setShowAdd(false);
      setEditingUser(null);
      setFormData({ 
        username: '', password: '', full_name: '', role: 'student', grade: '', section: '',
        assigned_grades: [], assigned_sections: [], assigned_subjects: []
      });
      fetchUsers();
    } else {
      const errorData = await res.json();
      alert(`فشل في حفظ المستخدم: ${errorData.message}`);
    }
  };

  const toggleList = (list: string[], item: string) => {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">إدارة المستخدمين</h2>
        <button 
          onClick={() => {
            setEditingUser(null);
            setFormData({ 
              username: '', password: '', full_name: '', role: 'student', grade: '', section: '',
              assigned_grades: [], assigned_sections: [], assigned_subjects: []
            });
            setShowAdd(true);
          }}
          className="btn-primary flex items-center gap-2 py-2"
        >
          <Plus size={20} /> إضافة مستخدم
        </button>
      </div>

      {showAdd && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-indigo-100 dark:border-slate-800 shadow-lg mb-8 transition-colors duration-300"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الاسم الكامل</label>
                <input 
                  type="text" 
                  required
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم المستخدم</label>
                <input 
                  type="text" 
                  required
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">كلمة المرور {editingUser && '(اتركها فارغة إذا كنت لا تريد التغيير)'}</label>
                <input 
                  type="password" 
                  required={!editingUser}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الدور</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as Role})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                >
                  <option value="student">طالب</option>
                  <option value="teacher">معلم</option>
                  <option value="admin">مسؤول</option>
                </select>
              </div>
            </div>

            {formData.role === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الصف الدراسي</label>
                  <select 
                    value={formData.grade}
                    onChange={e => setFormData({...formData, grade: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                  >
                    <option value="">اختر الصف</option>
                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الشعبة</label>
                  <select 
                    value={formData.section}
                    onChange={e => setFormData({...formData, section: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                  >
                    <option value="">اختر الشعبة</option>
                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}

            {formData.role === 'teacher' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">المواد الدراسية</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {subjects.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({...formData, assigned_subjects: toggleList(formData.assigned_subjects, s)})}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${formData.assigned_subjects.includes(s) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الصفوف الدراسية</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {grades.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({...formData, assigned_grades: toggleList(formData.assigned_grades, g)})}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${formData.assigned_grades.includes(g) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الشعب الدراسية</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {sections.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({...formData, assigned_sections: toggleList(formData.assigned_sections, s)})}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${formData.assigned_sections.includes(s) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-6 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300"
              >
                إلغاء
              </button>
              <button 
                type="submit"
                className="btn-primary px-8 py-2"
              >
                {editingUser ? 'تحديث' : 'إضافة'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">الاسم الكامل</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">اسم المستخدم</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">الدور</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">الصف/المواد</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100 font-medium">{u.full_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{u.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      u.role === 'admin' ? 'bg-amber-100 text-amber-600' : 
                      u.role === 'teacher' ? 'bg-indigo-100 text-indigo-600' : 
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {u.role === 'admin' ? 'مسؤول' : u.role === 'teacher' ? 'معلم' : 'طالب'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {u.role === 'student' ? `${u.grade} - الشعبة ${u.section}` : 
                     u.role === 'teacher' ? `${u.assigned_subjects?.join(', ')} (${u.assigned_grades?.length} صفوف)` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(u)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ExamTakingView = ({ exam, user, onComplete }: { exam: Exam, user: User, onComplete: (score: number, total: number) => void }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);

  useEffect(() => {
    fetch(getApiUrl(`/api/exam-questions/${exam.id}`))
      .then(res => res.json())
      .then(data => {
        const parsedData = data.map((q: any) => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }));
        setQuestions(parsedData);
        setLoading(false);
      });
  }, [exam.id]);

  const handleSelectOption = (option: string) => {
    if (showFeedback[currentQuestion.id]) return;
    setAnswers({ ...answers, [currentQuestion.id]: option });
    setShowFeedback({ ...showFeedback, [currentQuestion.id]: true });
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        score++;
      }
    });

    try {
      await fetch(getApiUrl('/api/exams/submit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          examId: exam.id,
          score,
          total: questions.length
        })
      });
      onComplete(score, questions.length);
    } catch (err) {
      console.error("Failed to submit exam", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  const currentQuestion = questions[currentQuestionIndex];
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{exam.title}</h3>
          <p className="text-sm text-slate-500">السؤال {currentQuestionIndex + 1} من {questions.length}</p>
        </div>
        <div className="flex items-center gap-2 text-xl font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-2xl">
          <Clock size={20} /> {formatTime(timeLeft)}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-lg">
        <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-8 leading-relaxed">
          {currentQuestion.question_text}
        </h4>

        <div className="space-y-4">
          {currentQuestion.type === 'short' ? (
            <div className="space-y-4">
              <input 
                type="text"
                disabled={showFeedback[currentQuestion.id]}
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                placeholder="اكتب إجابتك هنا..."
                className={`w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all ${
                  showFeedback[currentQuestion.id]
                    ? answers[currentQuestion.id] === currentQuestion.correct_answer
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700'
                      : 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700'
                    : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 bg-white dark:bg-slate-800'
                }`}
              />
              {!showFeedback[currentQuestion.id] && (
                <button 
                  onClick={() => setShowFeedback({ ...showFeedback, [currentQuestion.id]: true })}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  تحقق من الإجابة
                </button>
              )}
              {showFeedback[currentQuestion.id] && (
                <div className={`p-4 rounded-xl font-bold flex items-center gap-2 ${
                  answers[currentQuestion.id] === currentQuestion.correct_answer
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  {answers[currentQuestion.id] === currentQuestion.correct_answer ? <CheckCircle2 /> : <XCircle />}
                  {answers[currentQuestion.id] === currentQuestion.correct_answer ? 'إجابة صحيحة!' : `خطأ! الإجابة الصحيحة هي: ${currentQuestion.correct_answer}`}
                </div>
              )}
            </div>
          ) : (
            currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === option;
              const isCorrect = option === currentQuestion.correct_answer;
              const hasAnswered = showFeedback[currentQuestion.id];

              let buttonClass = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-indigo-800';
              let icon = null;

              if (hasAnswered) {
                if (isCorrect) {
                  buttonClass = 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400';
                  icon = <CheckCircle2 size={24} className="text-emerald-500" />;
                } else if (isSelected) {
                  buttonClass = 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-700 dark:text-rose-400';
                  icon = <XCircle size={24} className="text-rose-500" />;
                }
              } else if (isSelected) {
                buttonClass = 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400';
              }

              return (
                <button
                  key={idx}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full p-5 rounded-2xl border text-right transition-all flex items-center justify-between group ${buttonClass}`}
                >
                  <span className="font-bold">{option}</span>
                  <div className="flex items-center gap-2">
                    {icon}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-600 dark:bg-indigo-400'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && !icon && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          className="flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-400 font-bold disabled:opacity-30"
        >
          <ChevronRight className="rotate-180" /> السابق
        </button>
        
        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-10 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-none"
          >
            {submitting ? 'جاري الإرسال...' : 'إنهاء الامتحان'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            التالي <ChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

const ExamsView = ({ user }: { user: User }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [result, setResult] = useState<{ score: number, total: number } | null>(null);

  const fetchExams = () => {
    setLoading(true);
    fetch(getApiUrl(`/api/exams-by-grade/${user.grade}`)).then(res => res.json()).then(data => {
      setExams(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchExams();
  }, [user.grade]);

  if (selectedExam) {
    return (
      <ExamTakingView 
        exam={selectedExam} 
        user={user} 
        onComplete={(score, total) => {
          setResult({ score, total });
          setSelectedExam(null);
          fetchExams();
        }} 
      />
    );
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl"
        >
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8">
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">أحسنت صنعاً!</h2>
          <p className="text-slate-500 mb-8">لقد أكملت الامتحان بنجاح.</p>
          
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
              <p className="text-xs text-slate-500 mb-1">النتيجة</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{result.score} / {result.total}</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
              <p className="text-xs text-slate-500 mb-1">النسبة المئوية</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round((result.score / result.total) * 100)}%
              </p>
            </div>
          </div>

          <button 
            onClick={() => setResult(null)}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            العودة للامتحانات
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">الامتحانات</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">اختبر معلوماتك وجمع المزيد من النقاط.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800">
          <ClipboardList size={64} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
          <p className="text-slate-500">لا توجد امتحانات متاحة حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <motion.div 
              key={exam.id}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <ClipboardList size={28} />
              </div>
              <h4 className="font-bold text-xl text-slate-900 dark:text-slate-100">{exam.title}</h4>
              <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock size={16} /> {exam.duration} دقيقة
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={16} className="text-amber-500" /> 100 XP
                </div>
              </div>
              <button 
                onClick={() => setSelectedExam(exam)}
                className="w-full mt-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                ابدأ الامتحان
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const ExamManagementView = ({ subject }: { subject: Subject }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddExam, setShowAddExam] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newExam, setNewExam] = useState({ title: '', duration: 30 });
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({ 
    questionText: '', 
    options: ['', ''], 
    correctAnswer: '', 
    type: 'mcq' as 'mcq' | 'tf' | 'short'
  });

  const addOption = () => {
    setNewQuestion({ ...newQuestion, options: [...newQuestion.options, ''] });
  };

  const removeOption = (index: number) => {
    const newOpts = newQuestion.options.filter((_, i) => i !== index);
    setNewQuestion({ ...newQuestion, options: newOpts });
  };

  const fetchExams = () => {
    fetch(getApiUrl(`/api/admin/exams/${subject.id}`)).then(res => res.json()).then(setExams);
  };

  const fetchQuestions = (examId: number) => {
    fetch(getApiUrl(`/api/admin/questions/${examId}`)).then(res => res.json()).then(data => {
      // Ensure options are parsed if they come as JSON string
      const parsedData = data.map((q: any) => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }));
      setQuestions(parsedData);
    });
  };

  useEffect(() => {
    fetchExams();
  }, [subject.id]);

  useEffect(() => {
    if (selectedExam) {
      fetchQuestions(selectedExam.id);
    }
  }, [selectedExam]);

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(getApiUrl('/api/admin/exams'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newExam, subjectId: subject.id })
    });
    if (res.ok) {
      setShowAddExam(false);
      setNewExam({ title: '', duration: 30 });
      fetchExams();
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    const url = editingQuestion ? `/api/admin/questions/${editingQuestion.id}` : '/api/admin/questions';
    const method = editingQuestion ? 'PUT' : 'POST';

    const res = await fetch(getApiUrl(url), {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newQuestion, examId: selectedExam.id })
    });

    if (res.ok) {
      setShowAddQuestion(false);
      setEditingQuestion(null);
      setNewQuestion({ questionText: '', options: ['', '', '', ''], correctAnswer: '', type: 'mcq' });
      fetchQuestions(selectedExam.id);
    }
  };

  const startEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setNewQuestion({
      questionText: q.question_text,
      options: q.options,
      correctAnswer: q.correct_answer,
      type: q.type
    });
    setShowAddQuestion(true);
  };

  const handleDeleteExam = async (id: number) => {
    if (window.confirm('هل تريد حذف هذا الامتحان وكل أسئلته؟')) {
      await fetch(getApiUrl(`/api/admin/exams/${id}`), { method: 'DELETE' });
      fetchExams();
      if (selectedExam?.id === id) setSelectedExam(null);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (window.confirm('هل تريد حذف هذا السؤال؟')) {
      await fetch(getApiUrl(`/api/admin/questions/${id}`), { method: 'DELETE' });
      if (selectedExam) fetchQuestions(selectedExam.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">امتحانات مادة {subject.name}</h3>
        <button 
          onClick={() => setShowAddExam(true)}
          className="flex items-center gap-2 py-2 px-4 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} /> إضافة امتحان
        </button>
      </div>

      {showAddExam && (
        <form onSubmit={handleAddExam} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-indigo-100 dark:border-slate-800 shadow-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">عنوان الامتحان</label>
              <input 
                type="text" required
                value={newExam.title}
                onChange={e => setNewExam({...newExam, title: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">المدة (بالدقائق)</label>
              <input 
                type="number" required
                value={newExam.duration}
                onChange={e => setNewExam({...newExam, duration: parseInt(e.target.value)})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAddExam(false)} className="px-4 py-2 text-slate-500 font-bold">إلغاء</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">حفظ</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map(exam => (
          <div 
            key={exam.id}
            onClick={() => setSelectedExam(exam)}
            className={`p-6 rounded-3xl border transition-all cursor-pointer group ${
              selectedExam?.id === exam.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-bold text-lg ${selectedExam?.id === exam.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100'}`}>{exam.title}</h4>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteExam(exam.id); }}
                className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-500">{exam.duration} دقيقة</p>
          </div>
        ))}
      </div>

      {selectedExam && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selectedExam.title}</h4>
              <p className="text-sm text-slate-500 mt-1">{questions.length} سؤال • {selectedExam.duration} دقيقة</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setEditingQuestion(null);
                  setNewQuestion({ questionText: '', options: ['', ''], correctAnswer: '', type: 'mcq' });
                  setShowAddQuestion(true);
                }}
                className="flex items-center gap-2 py-2 px-4 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                <Plus size={18} /> إضافة سؤال
              </button>
              <button 
                onClick={() => setSelectedExam(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                إغلاق
              </button>
            </div>
          </div>

          {showAddQuestion && (
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSaveQuestion} 
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-indigo-100 dark:border-slate-800 shadow-xl space-y-6 transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {editingQuestion ? 'تعديل السؤال' : 'سؤال جديد'}
                </h5>
                <div className="flex gap-2">
                  {(['mcq', 'tf', 'short'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const options = type === 'mcq' ? ['', ''] : type === 'tf' ? ['صح', 'خطأ'] : [];
                        setNewQuestion({...newQuestion, type, options, correctAnswer: type === 'tf' ? 'صح' : ''});
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        newQuestion.type === type 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {type === 'mcq' ? 'اختيارات' : type === 'tf' ? 'صح/خطأ' : 'إجابة قصيرة'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">نص السؤال</label>
                  <textarea 
                    required
                    rows={3}
                    value={newQuestion.questionText}
                    onChange={e => setNewQuestion({...newQuestion, questionText: e.target.value})}
                    placeholder="اكتب السؤال هنا..."
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  />
                </div>

                {newQuestion.type === 'mcq' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">الخيارات</label>
                    {newQuestion.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 ${newQuestion.correctAnswer === opt && opt !== '' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`} />
                        <input 
                          type="text" required
                          value={opt}
                          onChange={e => {
                            const newOpts = [...newQuestion.options];
                            newOpts[idx] = e.target.value;
                            setNewQuestion({...newQuestion, options: newOpts});
                          }}
                          placeholder={`الخيار ${idx + 1}`}
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                        <button 
                          type="button"
                          onClick={() => removeOption(idx)}
                          disabled={newQuestion.options.length <= 2}
                          className="p-2 text-slate-400 hover:text-rose-500 disabled:opacity-0"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={addOption}
                      className="text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-1 hover:underline"
                    >
                      <Plus size={16} /> إضافة خيار آخر
                    </button>
                  </div>
                )}

                {newQuestion.type === 'tf' && (
                  <div className="flex gap-4">
                    {['صح', 'خطأ'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setNewQuestion({...newQuestion, correctAnswer: val})}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${
                          newQuestion.correctAnswer === val 
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 text-indigo-600' 
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الإجابة الصحيحة</label>
                  {newQuestion.type === 'mcq' ? (
                    <select 
                      required
                      value={newQuestion.correctAnswer}
                      onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                      className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      <option value="">اختر الإجابة الصحيحة</option>
                      {newQuestion.options.map((opt, idx) => opt && (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : newQuestion.type === 'short' ? (
                    <input 
                      type="text" required
                      value={newQuestion.correctAnswer}
                      onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                      placeholder="الإجابة النموذجية..."
                      className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowAddQuestion(false); setEditingQuestion(null); }} 
                  className="px-6 py-2 text-slate-500 font-bold hover:text-slate-700 transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  {editingQuestion ? 'تحديث السؤال' : 'إضافة السؤال'}
                </button>
              </div>
            </motion.form>
          )}

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div 
                key={q.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">
                        {q.type === 'mcq' ? 'اختيارات' : q.type === 'tf' ? 'صح/خطأ' : 'إجابة قصيرة'}
                      </span>
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 font-bold leading-relaxed">{q.question_text}</p>
                    
                    {q.type === 'mcq' && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, i) => (
                          <div 
                            key={i}
                            className={`px-4 py-2 rounded-xl text-sm border ${
                              opt === q.correct_answer 
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-700 dark:text-emerald-400 font-bold' 
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-500'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {(q.type === 'tf' || q.type === 'short') && (
                      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-bold">
                        <CheckCircle2 size={16} />
                        الإجابة: {q.correct_answer}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEditQuestion(q)}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CurriculumManagementView = ({ user }: { user: User }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  
  const defaultGrade = user.role === 'student' ? user.grade : 
                      (user.role === 'teacher' && user.assigned_grades?.length ? user.assigned_grades[0] : 'السادس الإعدادي');
  
  const [selectedGrade, setSelectedGrade] = useState<string>(defaultGrade);
  const [newSubject, setNewSubject] = useState({ name: '', grade: defaultGrade });
  const [newLesson, setNewLesson] = useState({ title: '', content: '', type: 'video', url: '', sourceType: 'url' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [managementMode, setManagementMode] = useState<'lessons' | 'exams'>('lessons');

  const availableGrades = user.role === 'admin' ? [
    'الخامس الابتدائي', 'السادس الابتدائي', 'الأول المتوسط', 'الثاني المتوسط', 'الثالث المتوسط', 'الرابع الإعدادي', 'الخامس الإعدادي', 'السادس الإعدادي'
  ] : user.role === 'teacher' ? (user.assigned_grades || []) : [user.grade];

  const fetchSubjects = () => {
    fetch(getApiUrl(`/api/subjects/${selectedGrade}`)).then(res => res.json()).then(data => {
      if (user.role === 'teacher') {
        setSubjects(data.filter(s => user.assigned_subjects?.includes(s.name)));
      } else {
        setSubjects(data);
      }
    });
  };

  const fetchLessons = (subjectId: number) => {
    fetch(getApiUrl(`/api/lessons/${subjectId}`)).then(res => res.json()).then(setLessons);
  };

  useEffect(() => {
    fetchSubjects();
  }, [selectedGrade]);

  useEffect(() => {
    if (selectedSubject) {
      fetchLessons(selectedSubject.id);
    }
  }, [selectedSubject]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(getApiUrl('/api/admin/subjects'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSubject)
    });
    if (res.ok) {
      setShowAddSubject(false);
      setNewSubject({ name: '', grade: 'السادس الإعدادي' });
      fetchSubjects();
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    
    const formData = new FormData();
    formData.append('subjectId', selectedSubject.id.toString());
    formData.append('title', newLesson.title);
    formData.append('content', newLesson.content);
    formData.append('type', newLesson.type);
    
    if (newLesson.sourceType === 'file' && selectedFile) {
      formData.append('file', selectedFile);
    } else {
      formData.append('url', newLesson.url);
    }

    const res = await fetch(getApiUrl('/api/admin/lessons'), {
      method: 'POST',
      body: formData
    });
    
    if (res.ok) {
      setShowAddLesson(false);
      setNewLesson({ title: '', content: '', type: 'video', url: '', sourceType: 'url' });
      setSelectedFile(null);
      fetchLessons(selectedSubject.id);
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (window.confirm('هل تريد حذف هذه المادة وكل دروسها؟')) {
      await fetch(getApiUrl(`/api/admin/subjects/${id}`), { method: 'DELETE' });
      fetchSubjects();
      if (selectedSubject?.id === id) setSelectedSubject(null);
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (window.confirm('هل تريد حذف هذا الدرس؟')) {
      await fetch(getApiUrl(`/api/admin/lessons/${id}`), { method: 'DELETE' });
      if (selectedSubject) fetchLessons(selectedSubject.id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">إدارة المناهج والدروس</h2>
        {availableGrades.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">عرض الصف:</span>
            <select 
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subjects Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">المواد الدراسية</h3>
            <button 
              onClick={() => setShowAddSubject(true)}
              className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg"
            >
              <Plus size={20} />
            </button>
          </div>

          {showAddSubject && (
            <form onSubmit={handleAddSubject} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-100 dark:border-slate-800 shadow-sm space-y-3 transition-colors duration-300">
              <input 
                type="text" 
                required
                placeholder="اسم المادة"
                value={newSubject.name}
                onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddSubject(false)} className="text-xs text-slate-500 dark:text-slate-400">إلغاء</button>
                <button type="submit" className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg">إضافة</button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {subjects.map(s => (
              <div 
                key={s.id}
                onClick={() => setSelectedSubject(s)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  selectedSubject?.id === s.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-800'
                }`}
              >
                <span className={`font-bold transition-colors duration-300 ${selectedSubject?.id === s.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100'}`}>{s.name}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteSubject(s.id); }}
                  className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  title="حذف"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Lessons/Exams Column */}
        <div className="lg:col-span-2 space-y-4">
          {selectedSubject ? (
            <>
              <div className="flex items-center gap-4 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
                <button 
                  onClick={() => setManagementMode('lessons')}
                  className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${managementMode === 'lessons' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                  الدروس
                </button>
                <button 
                  onClick={() => setManagementMode('exams')}
                  className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${managementMode === 'exams' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                  الامتحانات
                </button>
              </div>

              {managementMode === 'lessons' ? (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">دروس مادة {selectedSubject.name}</h3>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => {
                      setNewLesson({ title: '', content: '', type: 'video', url: '', sourceType: 'url' });
                      setShowAddLesson(true);
                    }}
                    className="flex items-center gap-2 py-2 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm hover:bg-red-600 dark:hover:bg-red-600 hover:text-white transition-all"
                  >
                    <PlayCircle size={18} /> إضافة فيديو
                  </button>
                  <button 
                    onClick={() => {
                      setNewLesson({ title: '', content: '', type: 'pdf', url: '', sourceType: 'file' });
                      setShowAddLesson(true);
                    }}
                    className="flex items-center gap-2 py-2 px-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-sm hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white transition-all"
                  >
                    <FileText size={18} /> إضافة ملف
                  </button>
                  <button 
                    onClick={() => {
                      setNewLesson({ title: '', content: '', type: 'text', url: '', sourceType: 'url' });
                      setShowAddLesson(true);
                    }}
                    className="flex items-center gap-2 py-2 px-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-sm hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <Link size={18} /> إضافة رابط
                  </button>
                </div>
              </div>

              {showAddLesson && (
                <form onSubmit={handleAddLesson} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-indigo-100 dark:border-slate-800 shadow-lg space-y-4 transition-colors duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">عنوان الدرس</label>
                      <input 
                        type="text" required
                        value={newLesson.title}
                        onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">النوع</label>
                      <select 
                        value={newLesson.type}
                        onChange={e => setNewLesson({...newLesson, type: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                      >
                        <option value="video">فيديو</option>
                        <option value="pdf">PDF</option>
                        <option value="text">نص</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">مصدر المحتوى</label>
                      <select 
                        value={newLesson.sourceType}
                        onChange={e => setNewLesson({...newLesson, sourceType: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                      >
                        <option value="url">رابط خارجي</option>
                        <option value="file">رفع ملف من الجهاز</option>
                        <option value="googleDrive">Google Drive</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      {newLesson.sourceType === 'url' ? (
                        <>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الرابط</label>
                          <input 
                            type="text" required
                            value={newLesson.url}
                            onChange={e => setNewLesson({...newLesson, url: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                            placeholder="https://..."
                          />
                        </>
                      ) : newLesson.sourceType === 'file' ? (
                        <>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اختر الملف</label>
                          <input 
                            type="file" required
                            onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                          />
                        </>
                      ) : (
                        <>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اختر من Google Drive</label>
                          <GoogleDrivePicker 
                            user={user} 
                            onSelect={(file) => {
                              setNewLesson({ ...newLesson, url: file.webViewLink, title: newLesson.title || file.name });
                            }} 
                          />
                          {newLesson.url && (
                            <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-2">
                              <CheckCircle2 size={16} className="text-indigo-600" />
                              <span className="text-xs text-indigo-600 font-bold truncate flex-1">{newLesson.url}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setShowAddLesson(false)} className="px-4 py-2 text-slate-500 dark:text-slate-400">إلغاء</button>
                    <button type="submit" className="btn-primary px-6 py-2">حفظ الدرس</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessons.map(l => (
                  <div key={l.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group transition-colors duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400">
                        {l.type === 'video' ? <PlayCircle size={20} /> : <FileText size={20} />}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{l.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const url = l.url.startsWith('http') ? l.url : getApiUrl(l.url);
                          window.open(url, '_blank'); 
                        }}
                        className="text-indigo-600 dark:text-indigo-400 p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded"
                        title="عرض"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteLesson(l.id)}
                        className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
                </>
              ) : (
                <ExamManagementView subject={selectedSubject} />
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
              <BookOpen size={64} strokeWidth={1} className="mb-4 opacity-20" />
              <p>اختر مادة من القائمة الجانبية لإدارة دروسها.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GradesView = ({ user }: { user: User }) => {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(
    user.role === 'student' ? user.grade : 
    (user.role === 'teacher' && (user.assigned_grades?.length || 0) === 1) ? user.assigned_grades![0] : null
  );
  const [selectedSection, setSelectedSection] = useState<string | null>(
    user.role === 'student' ? user.section : null
  );
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [content, setContent] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState({ title: '', description: '', url: '', type: 'link', sourceType: 'url' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const allGrades = [
    'الخامس الابتدائي',
    'السادس الابتدائي',
    'الأول المتوسط',
    'الثاني المتوسط',
    'الثالث المتوسط',
    'الرابع الإعدادي',
    'الخامس الإعدادي',
    'السادس الإعدادي'
  ];

  const availableGrades = user.role === 'admin' ? allGrades : 
                         user.role === 'teacher' ? (user.assigned_grades || []) : 
                         [user.grade];

  const availableSections = user.role === 'admin' ? ['أ', 'ب', 'ج', 'د', 'هـ'] :
                           user.role === 'teacher' ? (user.assigned_sections || []) :
                           [user.section];

  const availableSubjects = user.role === 'admin' ? [
    'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'اللغة العربية', 'اللغة الإنجليزية', 'التاريخ', 'الجغرافيا', 'التربية الإسلامية'
  ] : user.role === 'teacher' ? (user.assigned_subjects || []) : [];

  const categories = [
    { id: 'textbooks', label: 'الكتب الدراسية', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'videos', label: 'الشرح الفيديوي', icon: PlayCircle, color: 'bg-red-500' },
    { id: 'summaries', label: 'الملازم', icon: FileText, color: 'bg-emerald-500' },
    { id: 'exams', label: 'الامتحانات', icon: ClipboardList, color: 'bg-amber-500' }
  ];

  useEffect(() => {
    if (selectedGrade && selectedCategory) {
      let url = `/api/grade-content/${selectedGrade}/${selectedCategory}`;
      const params = new URLSearchParams();
      if (selectedSection) params.append('section', selectedSection);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (params.toString()) url += `?${params.toString()}`;

      fetch(getApiUrl(url))
        .then(res => res.json())
        .then(setContent);
    }
  }, [selectedGrade, selectedCategory, selectedSection, selectedSubject]);

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('grade', selectedGrade || '');
    formData.append('category', selectedCategory || '');
    formData.append('title', newContent.title);
    formData.append('description', newContent.description);
    formData.append('type', newContent.type);
    formData.append('section', selectedSection || '');
    formData.append('subject', selectedSubject || '');

    if (newContent.sourceType === 'file' && selectedFile) {
      formData.append('file', selectedFile);
    } else {
      formData.append('url', newContent.url);
    }

    const res = await fetch(getApiUrl('/api/grade-content'), {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      setShowAddForm(false);
      setNewContent({ title: '', description: '', url: '', type: 'link', sourceType: 'url' });
      setSelectedFile(null);
      // Refresh content
      let url = `/api/grade-content/${selectedGrade}/${selectedCategory}`;
      const params = new URLSearchParams();
      if (selectedSection) params.append('section', selectedSection);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (params.toString()) url += `?${params.toString()}`;
      
      fetch(getApiUrl(url))
        .then(res => res.json())
        .then(setContent);
    }
  };

  if (!selectedGrade) {
    return (
      <div className="space-y-8">
        <header>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">الصفوف الدراسية</h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">اختر الصف الدراسي لعرض المحتوى التعليمي.</p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableGrades.map((grade) => (
            <motion.div
              key={grade}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedGrade(grade)}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <GraduationCap size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{grade}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">اضغط لاستكشاف الكتب والملازم والفيديوهات</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (user.role === 'teacher' && !selectedSubject) {
    return (
      <div className="space-y-8">
        <button 
          onClick={() => setSelectedGrade(null)}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          <ChevronRight size={20} className="transform rotate-0" /> العودة للصفوف
        </button>
        <header>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">المواد الدراسية - {selectedGrade}</h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">اختر المادة التي تريد إدارتها.</p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableSubjects.map((sub) => (
            <motion.div
              key={sub}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedSubject(sub)}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <BookOpen size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{sub}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if ((user.role === 'teacher' || user.role === 'admin') && !selectedSection) {
    return (
      <div className="space-y-8">
        <button 
          onClick={() => user.role === 'teacher' ? setSelectedSubject(null) : setSelectedGrade(null)}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          <ChevronRight size={20} className="transform rotate-0" /> العودة
        </button>
        <header>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">الشعب الدراسية - {selectedGrade} {selectedSubject && `(${selectedSubject})`}</h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">اختر الشعبة لعرض أو إضافة المحتوى.</p>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {availableSections.map((sec) => (
            <motion.div
              key={sec}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedSection(sec)}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 text-2xl font-bold">
                {sec}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">شعبة {sec}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (user.role === 'teacher' || user.role === 'admin') {
                setSelectedSection(null);
              } else {
                setSelectedGrade(null);
              }
            }}
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            <ChevronRight size={20} className="transform rotate-0" /> العودة
          </button>
        </div>
        <header>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{selectedGrade} {selectedSubject && `- ${selectedSubject}`} {selectedSection && `- شعبة ${selectedSection}`}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">اختر القسم الذي تريد تصفحه.</p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedCategory(cat.id)}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer flex items-center gap-6 group"
            >
              <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                <cat.icon size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{cat.label}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">تصفح وإضافة محتوى {cat.label}</p>
              </div>
              <ChevronRight className="mr-auto text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors transform rotate-180" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          <ChevronRight size={20} className="transform rotate-0" /> العودة للأقسام
        </button>
        {(user.role === 'admin' || user.role === 'teacher') && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2 py-2"
          >
            <Plus size={20} /> إضافة محتوى
          </button>
        )}
      </div>

      <header>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {categories.find(c => c.id === selectedCategory)?.label} - {selectedGrade} {selectedSubject && `(${selectedSubject})`} {selectedSection && `(شعبة ${selectedSection})`}
        </h2>
      </header>

      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-indigo-100 dark:border-slate-800 shadow-lg transition-colors duration-300"
        >
          <form onSubmit={handleAddContent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">العنوان</label>
              <input 
                type="text" 
                required
                value={newContent.title}
                onChange={e => setNewContent({...newContent, title: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                placeholder="مثال: كتاب الرياضيات المنهجي"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الوصف</label>
              <textarea 
                value={newContent.description}
                onChange={e => setNewContent({...newContent, description: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                placeholder="وصف بسيط للمحتوى"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">نوع المحتوى</label>
              <select 
                value={newContent.type}
                onChange={e => setNewContent({...newContent, type: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
              >
                <option value="link">رابط (Link)</option>
                <option value="video">فيديو (Video)</option>
                <option value="file">ملف (File/PDF)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">مصدر المحتوى</label>
              <select 
                value={newContent.sourceType}
                onChange={e => setNewContent({...newContent, sourceType: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
              >
                <option value="url">رابط خارجي</option>
                <option value="file">رفع ملف من الجهاز</option>
              </select>
            </div>
            <div className="md:col-span-2">
              {newContent.sourceType === 'url' ? (
                <>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الرابط (URL)</label>
                  <input 
                    type="text" 
                    required
                    value={newContent.url}
                    onChange={e => setNewContent({...newContent, url: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                    placeholder="رابط الملف أو الفيديو أو الامتحان"
                  />
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اختر الملف</label>
                  <input 
                    type="file" 
                    required
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                  />
                </>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="btn-secondary py-2"
              >
                إلغاء
              </button>
              <button type="submit" className="btn-primary py-2">
                حفظ المحتوى
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-500">
            <FileText size={64} strokeWidth={1} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">لا يوجد محتوى مضاف حالياً في هذا القسم.</p>
          </div>
        ) : (
          content.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  {item.type === 'video' ? <PlayCircle size={24} /> : item.type === 'file' ? <FileText size={24} /> : <BookOpen size={24} />}
                </div>
                {(user.role === 'admin' || user.role === 'teacher') && (
                  <button 
                    onClick={async () => {
                      if(window.confirm('هل تريد حذف هذا المحتوى؟')) {
                        await fetch(getApiUrl(`/api/grade-content/${item.id}`), { method: 'DELETE' });
                        setContent(content.filter(c => c.id !== item.id));
                      }
                    }}
                    className="text-red-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                  >
                    حذف
                  </button>
                )}
              </div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">{item.title}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">{item.description}</p>
              <a 
                href={item.url.startsWith('http') ? item.url : getApiUrl(item.url)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"
              >
                عرض المحتوى <ChevronRight size={18} className="transform rotate-180" />
              </a>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'رسالة جديدة', message: 'لقد أرسل لك المعلم رسالة جديدة بخصوص الواجب.', time: 'منذ 5 دقائق', read: false, type: 'message' },
    { id: 2, title: 'تحدي جديد', message: 'تمت إضافة تحدي الأسبوع الجديد. شارك الآن!', time: 'منذ ساعة', read: false, type: 'challenge' },
    { id: 3, title: 'تقييم الواجب', message: 'تم تقييم واجب الرياضيات الخاص بك. الدرجة: 95/100', time: 'منذ ساعتين', read: true, type: 'grade' },
  ]);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, roles: ['student', 'teacher', 'admin'] },
    { id: 'leaderboard', label: 'المتصدرون', icon: Trophy, roles: ['student', 'teacher', 'admin'] },
    { id: 'grades', label: 'الصفوف الدراسية', icon: GraduationCap, roles: ['student', 'teacher', 'admin'] },
    { id: 'subjects', label: 'موادي الدراسية', icon: BookOpen, roles: ['student'] },
    { id: 'assignments', label: 'الواجبات', icon: FileUp, roles: ['student', 'teacher'] },
    { id: 'exams', label: 'الامتحانات', icon: ClipboardList, roles: ['student'] },
    { id: 'ai-chat', label: 'المساعد الذكي', icon: Sparkles, roles: ['student', 'teacher', 'admin'] },
    { id: 'chat', label: 'الرسائل', icon: MessageSquare, roles: ['student', 'teacher'] },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users, roles: ['admin'] },
    { id: 'curriculum', label: 'المناهج الدراسية', icon: Settings, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-[70] shadow-2xl p-6 lg:hidden transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Logo size="sm" />
                  <div className="flex items-center gap-0 font-display font-bold text-xl tracking-tight">
                    <span className="text-amber-400">star</span>
                    <span className="text-indigo-600 dark:text-indigo-400">Edu</span>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 dark:text-slate-500">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <div className="space-y-2">
                {filteredMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="absolute bottom-8 left-6 right-6">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 text-red-600 bg-red-50 dark:bg-red-900/10 rounded-xl font-bold"
                >
                  <LogOut size={20} />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 px-4 md:px-6 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-400 lg:hidden"
          >
            <Plus className="rotate-0" size={24} />
          </button>
          <Logo size="sm" />
          <div className="flex items-center gap-0 font-display font-bold text-xl tracking-tight">
            <span className="text-amber-400">star</span>
            <span className="text-indigo-600 dark:text-indigo-400">Edu</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all relative"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-[55]" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-[60] overflow-hidden transition-colors duration-300"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">التنبيهات</h4>
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] text-indigo-600 font-bold hover:underline"
                      >
                        تحديد الكل كمقروء
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">لا توجد تنبيهات حالياً</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => markAsRead(n.id)}
                            className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative group ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                          >
                            <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                n.type === 'message' ? 'bg-blue-100 text-blue-600' :
                                n.type === 'challenge' ? 'bg-amber-100 text-amber-600' :
                                'bg-emerald-100 text-emerald-600'
                              }`}>
                                {n.type === 'message' ? <MessageSquare size={16} /> :
                                 n.type === 'challenge' ? <Trophy size={16} /> :
                                 <ClipboardList size={16} />}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.title}</p>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                    className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                                <p className="text-[9px] text-slate-400 mt-1">{n.time}</p>
                              </div>
                            </div>
                            {!n.read && <span className="absolute top-4 left-4 w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-center">
                      <button className="text-xs text-slate-500 font-bold hover:text-indigo-600 transition-colors">عرض جميع التنبيهات</button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.full_name}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role === 'admin' ? 'مسؤول' : user.role === 'teacher' ? 'معلم' : 'طالب'} {user.grade ? `• ${user.grade}` : ''}</span>
          </div>
          <button 
            onClick={() => {
              if (window.confirm('هل أنت متأكد من رغبتك في تسجيل الخروج؟')) {
                handleLogout();
              }
            }}
            className="flex items-center gap-2 px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all rounded-lg font-medium"
          >
            <span className="text-sm hidden sm:inline">تسجيل الخروج</span>
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      
      <main className={`pt-20 pb-24 lg:pb-12 px-4 md:px-6 transition-all duration-300 ${isSidebarOpen ? 'lg:mr-64' : ''}`}>
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <StudentDashboard user={user} setActiveTab={setActiveTab} />}
              {activeTab === 'leaderboard' && <LeaderboardView user={user} />}
              {activeTab === 'subjects' && <SubjectsView user={user} />}
              {activeTab === 'assignments' && <AssignmentsView user={user} />}
              {activeTab === 'exams' && <ExamsView user={user} />}
              {activeTab === 'wallet' && <PaymentView user={user} />}
              {activeTab === 'grades' && <GradesView user={user} />}
              {activeTab === 'ai-chat' && <AIChatView user={user} />}
              {activeTab === 'chat' && <ChatView user={user} />}
              {activeTab === 'profile' && <ProfileView user={user} />}
              {activeTab === 'settings' && <SettingsView user={user} />}
              {activeTab === 'users' && <AdminUsersView />}
              {activeTab === 'curriculum' && <CurriculumManagementView user={user} />}
              {/* Other tabs would go here */}
              {activeTab !== 'dashboard' && activeTab !== 'leaderboard' && activeTab !== 'grades' && activeTab !== 'chat' && activeTab !== 'ai-chat' && activeTab !== 'users' && activeTab !== 'assignments' && activeTab !== 'subjects' && activeTab !== 'profile' && activeTab !== 'settings' && activeTab !== 'curriculum' && activeTab !== 'exams' && activeTab !== 'wallet' && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Settings size={64} strokeWidth={1} className="mb-4" />
                  <h3 className="text-xl font-semibold">القسم قيد التطوير</h3>
                  <p>نحن نعمل بجد لتوفير ميزات {activeTab} قريباً!</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
    </div>
  );
}
