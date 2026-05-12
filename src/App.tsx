import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { db } from "./db/db";
import { auth } from "./db/firebase";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { doc, getDocFromServer } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { AgendaSportView } from "./views/AgendaSportView";
import { AgendaPersonalView } from "./views/AgendaPersonalView";
import { RubricaView } from "./views/RubricaView";
import { NavigatoreView } from "./views/NavigatoreView";
import { LoginView } from "./views/LoginView";
import { DashboardView } from "./views/DashboardView";
import { GuidaView } from "./views/GuidaView";
import { ImpostazioniView } from "./views/ImpostazioniView";
import { cn } from "./lib/utils";
import { playNotificationSound } from "./lib/notifications";
import { Globe, CalendarDays, User, Users, Navigation, Menu, X, BellRing, Clock, LogOut, Settings, LayoutDashboard, HelpCircle } from "lucide-react";
import { Toaster, toast } from "sonner";

type ViewType = 'dashboard' | 'agenda-sport' | 'agenda-personal' | 'rubrica' | 'navigatore' | 'impostazioni' | 'guida';

function LanguageIndicator() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0].toUpperCase();
  
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 text-[10px] font-bold text-slate-400">
      <Globe className="w-3.5 h-3.5 text-indigo-400" />
      <span>{currentLang}</span>
    </div>
  );
}

function ClockDisplay() {
  const { i18n } = useTranslation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateLocale = i18n.language.startsWith('it') ? it : enUS;

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-indigo-400" />
      <div>
        <div className="text-sm font-bold text-slate-200 tabular-nums leading-none mb-1">
          {format(now, "HH:mm:ss")}
        </div>
        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
          {format(now, "EEEE d MMMM", { locale: dateLocale })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const savedColor = localStorage.getItem('theme-border');
    if (savedColor) {
      document.documentElement.style.setProperty('--theme-border', savedColor);
    }
  }, []);

  // Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (currentUser) {
         try {
           const { getDb, handleFirestoreError, OperationType } = await import("./db/firebase");
           const dbFirestore = getDb();
           const testDoc = doc(dbFirestore, 'test', 'connection');
           try {
             await getDocFromServer(testDoc);
           } catch (err) {
             handleFirestoreError(err, OperationType.GET, 'test/connection');
           }
         } catch (error) {
           console.warn("Firebase connection test failed.", error);
         }
      }
    });
    return () => unsubscribe();
  }, []);

  // Notification Permissions and Reminder Engine
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkReminders = async () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      
      const now = new Date();
      try {
        // Check Sport Matches
        const matches = await db.matches.toArray();
        matches.forEach((m) => {
          if (!m.reminders || m.reminders.length === 0) return;
            m.reminders.forEach((r) => {
            const reminderTime = new Date(m.date.getTime() - r * 60000);
            const diff = now.getTime() - reminderTime.getTime();
            if (diff >= 0 && diff < 60000) {
              const msg = `${t('common.agendaSport')}: ${m.title}`;
              const body = `${format(m.date, "HH:mm")} - ${m.location}`;
              new Notification(msg, { body });
              toast.info(msg, { description: body });
              playNotificationSound();
            }
          });
        });

        // Check Personal Events
        const personalEvents = await db.personalEvents.toArray();
        personalEvents.forEach((e) => {
          if (!e.reminders || e.reminders.length === 0) return;
          e.reminders.forEach((r) => {
            const reminderTime = new Date(e.date.getTime() - r * 60000);
            const diff = now.getTime() - reminderTime.getTime();
            if (diff >= 0 && diff < 60000) {
              const msg = `${t('common.agendaPersonal')}: ${e.title}`;
              const body = `${format(e.date, "HH:mm")} - ${e.location}`;
              new Notification(msg, { body });
              toast.info(msg, { description: body });
              playNotificationSound();
            }
          });
        });
      } catch (err) {
        console.error("Error checking reminders", err);
      }
    };

    if (user) {
      checkReminders();
      const interval = setInterval(checkReminders, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const navItems = [
    { id: 'dashboard', label: t('common.dashboard'), icon: LayoutDashboard },
    { id: 'agenda-sport', label: t('common.agendaSport'), icon: CalendarDays },
    { id: 'agenda-personal', label: t('common.agendaPersonal'), icon: User },
    { id: 'rubrica', label: t('common.rubrica'), icon: Users },
    { id: 'navigatore', label: t('common.navigatore'), icon: Navigation },
    { id: 'impostazioni', label: t('common.impostazioni'), icon: Settings },
    { id: 'guida', label: t('common.guida'), icon: HelpCircle },
  ] as const;

  const handleNavClick = (view: ViewType) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans text-slate-100 overflow-hidden">
      <Toaster theme="dark" position="bottom-right" />
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 z-50 shadow-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <CalendarDays className="w-6 h-6 text-white drop-shadow-md" />
            </div>
            <span className="font-display font-black text-xl tracking-tighter text-white text-3d leading-none pt-1">OneLife<br/><span className="text-[10px] tracking-widest text-indigo-300 font-bold opacity-80 uppercase" style={{ textShadow: 'none' }}>Manager</span></span>
          </div>
          <div className="pl-1">
             <ClockDisplay />
          </div>
        </div>
        <div className="flex items-center gap-2">
            <LanguageIndicator />
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors self-start"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
      </div>

      {/* Sidebar (Desktop) / Mobile Menu */}
      <aside className={cn(
        "bg-slate-900 border-r border-slate-700/50 flex flex-col absolute md:relative z-40 h-[calc(100vh-95px)] top-[95px] md:top-0 md:h-screen w-full md:w-72 transition-transform duration-300 md:translate-x-0 shrink-0",
        isMobileMenuOpen ? "translate-x-0 shadow-[0_0_40px_rgba(0,0,0,0.8)]" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex flex-col border-b border-slate-800/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/30 ring-1 ring-white/10">
              <CalendarDays className="w-7 h-7 text-white drop-shadow-md" />
            </div>
            <div className="flex flex-col pt-1">
              <span className="font-display font-black text-3xl tracking-tighter text-white text-3d leading-none mb-1">OneLife</span>
              <span className="text-[10px] tracking-[0.2em] font-bold text-indigo-400 uppercase" style={{ textShadow: 'none' }}>Manager</span>
            </div>
          </div>
          <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80 shadow-inner flex flex-col">
            <ClockDisplay />
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-3 mt-4">{t('common.mainMenu')}</p>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-bold",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-indigo-200" : "text-slate-500")} />
                {item.label}
              </button>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800/50">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profilo" className="w-8 h-8 rounded-full border border-slate-700" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                <div className="text-left w-32 overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{user.displayName || t('common.user')}</p>
                  <p className="text-[10px] text-emerald-400">Online</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 transition-colors p-1"
                title={t('common.logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-800/50">
              {("Notification" in window) && Notification.permission !== "granted" && (
                <button 
                  onClick={() => Notification.requestPermission()}
                  className="w-full text-center text-[10px] bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 px-2 py-1.5 rounded border border-indigo-500/20 font-bold uppercase transition-colors"
                >
                  {t('common.enableNotifications')}
                </button>
              )}
              {("Notification" in window) && Notification.permission === "granted" && (
                <div className="flex items-center justify-between w-full text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>{t('common.notificationsEnabled')}</span>
                    <LanguageIndicator />
                  </div>
                  <button 
                    onClick={() => {
                      new Notification("OneLife Manager", {
                        body: t('common.notificationsActiveMsg'),
                      });
                      toast.success(t('common.notificationsActiveMsg'));
                      playNotificationSound();
                    }}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                    title={t('common.notificationsTest')}
                  >
                    <BellRing className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto w-full h-[calc(100vh-95px)] md:h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'agenda-sport' && <AgendaSportView />}
          {currentView === 'agenda-personal' && <AgendaPersonalView />}
          {currentView === 'rubrica' && <RubricaView />}
          {currentView === 'navigatore' && <NavigatoreView />}
          {currentView === 'impostazioni' && <ImpostazioniView />}
          {currentView === 'guida' && <GuidaView />}
        </div>
      </main>
    </div>
  );
}
