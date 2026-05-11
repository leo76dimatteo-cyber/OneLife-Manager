import React, { useState, useRef } from 'react';
import { auth } from '../db/firebase';
import { updatePassword } from 'firebase/auth';
import { db } from '../db/db';
import { Settings, Save, Download, Upload, Shield, Palette, Languages } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const COLORS = [
  { name: 'Default', value: 'rgba(51, 65, 85, 0.5)' },
  { name: 'Fluo Pink', value: '#ff00ff' },
  { name: 'Fluo Green', value: '#39ff14' },
  { name: 'Fluo Cyan', value: '#00ffff' },
  { name: 'Fluo Yellow', value: '#eaff00' },
  { name: 'Fluo Orange', value: '#ff5e00' },
  { name: 'Fluo Purple', value: '#b026ff' },
];

export function ImpostazioniView() {
  const { t, i18n } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [currentColor, setCurrentColor] = useState(() => localStorage.getItem('theme-border') || 'rgba(51, 65, 85, 0.5)');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setAuthError(t('settings.security.errorMismatch'));
      return;
    }
    try {
      setAuthError(null);
      setAuthSuccess(false);
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setAuthSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setAuthError(t('settings.security.errorUnauthentic'));
      }
    } catch (err) {
      console.error(err);
      setAuthError((err as Error).message);
    }
  };

  const handleExportData = async () => {
    try {
      const data = {
        matches: await db.matches.toArray(),
        personalEvents: await db.personalEvents.toArray(),
        contacts: await db.contacts.toArray(),
        arenas: await db.arenas.toArray(),
        syncInfo: await db.syncInfo.toArray(),
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `onelife_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      toast.error(t('settings.backup.exportError', 'Errore durante il backup dei dati'));
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      await db.transaction('rw', [db.matches, db.personalEvents, db.contacts, db.arenas, db.syncInfo], async () => {
        if (data.matches) { await db.matches.clear(); await db.matches.bulkAdd(data.matches); }
        if (data.personalEvents) { await db.personalEvents.clear(); await db.personalEvents.bulkAdd(data.personalEvents); }
        if (data.contacts) { await db.contacts.clear(); await db.contacts.bulkAdd(data.contacts); }
        if (data.arenas) { await db.arenas.clear(); await db.arenas.bulkAdd(data.arenas); }
        if (data.syncInfo) { await db.syncInfo.clear(); await db.syncInfo.bulkAdd(data.syncInfo); }
      });
      toast.success(t('settings.backup.importSuccess'));
      setTimeout(() => window.location.reload(), 1500); // Reload to refresh all views 
    } catch (err) {
      console.error('Import error:', err);
      toast.error(t('settings.backup.importError'));
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearTranslationCache = async () => {
    await db.translations.clear();
    toast.success(t('settings.language.cacheCleared', 'Translation cache cleared. Reloader to update.'));
    setTimeout(() => window.location.reload(), 1500);
  };

  const commonLanguages = [
    { code: 'it', name: 'Italiano' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center shadow-lg border border-indigo-500/30">
          <Settings className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tight text-white mb-1">{t('settings.title')}</h1>
          <p className="text-sm text-slate-400 font-medium">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-400" />
              {t('settings.theme.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-400">{t('settings.theme.subtitle')}</p>
              <div className="flex flex-wrap gap-4">
                {COLORS.map(color => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setCurrentColor(color.value);
                      localStorage.setItem('theme-border', color.value);
                      document.documentElement.style.setProperty('--theme-border', color.value);
                    }}
                    className={cn(
                      "w-12 h-12 rounded-full border-2 transition-all duration-300 shadow-[0_0_15px_var(--tw-shadow-color)]",
                      currentColor === color.value ? "scale-110 border-white" : "border-transparent scale-100 hover:scale-105 hover:border-white/50"
                    )}
                    style={{ backgroundColor: color.value !== 'rgba(51, 65, 85, 0.5)' ? color.value : '#1e293b', '--tw-shadow-color': color.value !== 'rgba(51, 65, 85, 0.5)' ? color.value : 'transparent' } as React.CSSProperties}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-indigo-400" />
              {t('settings.language.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <label className="text-sm font-bold text-slate-300">{t('settings.language.select')}</label>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                 {commonLanguages.map(lng => (
                   <Button 
                    key={lng.code}
                    variant={i18n.language.startsWith(lng.code) ? 'default' : 'outline'}
                    onClick={() => i18n.changeLanguage(lng.code)}
                    className="w-full h-10"
                  >
                    {lng.name}
                  </Button>
                 ))}
               </div>
               <div className="pt-4 border-t border-slate-800">
                 <p className="text-[10px] text-slate-500 italic mb-3">{t('settings.language.auto')}</p>
                 <Button variant="ghost" size="sm" onClick={clearTranslationCache} className="text-xs text-indigo-400 hover:text-indigo-300 h-8">
                   <Upload className="w-3.5 h-3.5 mr-1.5" />
                   {t('settings.language.clearCache', 'Aggiorna traduzioni automatiche')}
                 </Button>
               </div>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              {t('settings.security.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {auth.currentUser?.email && (
                <div className="mb-4">
                  <p className="text-sm text-slate-400">{t('settings.security.loggedInAs')}</p>
                  <p className="font-bold text-white">{auth.currentUser.email}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">{t('settings.security.newPassword')}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">{t('settings.security.confirmPassword')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  minLength={6}
                />
              </div>

              {authError && <p className="text-red-400 text-sm font-bold">{authError}</p>}
              {authSuccess && <p className="text-emerald-400 text-sm font-bold">{t('settings.security.success')}</p>}

              <Button type="submit" className="w-full" disabled={!newPassword || newPassword !== confirmPassword}>
                <Save className="w-4 h-4 mr-2" />
                {t('settings.security.update')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="w-5 h-5 text-indigo-400" />
              {t('settings.backup.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  {t('settings.backup.exportDesc')}
                </p>
                <Button onClick={handleExportData} className="w-full bg-slate-800 hover:bg-slate-700 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  {t('settings.backup.exportBtn')}
                </Button>
              </div>

              <div className="w-full h-px bg-slate-800"></div>

              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  {t('settings.backup.importDesc')} <strong className="text-red-400">{t('settings.backup.importWarning')}</strong>
                </p>
                <input 
                  type="file" 
                  accept=".json" 
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={handleImportData}
                />
                <Button onClick={handleImportClick} variant="outline" className="w-full text-red-400 border-red-900 hover:bg-red-950 hover:text-red-300">
                  <Upload className="w-4 h-4 mr-2" />
                  {t('settings.backup.importBtn')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
