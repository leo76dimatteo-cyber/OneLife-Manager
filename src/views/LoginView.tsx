import React, { useState } from 'react';
import { auth } from '../db/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithRedirect } from 'firebase/auth';
import { CalendarDays, Mail, Lock } from 'lucide-react';
import { Button } from '../components/ui';

export function LoginView() {
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      if (isIOS) {
        await signInWithRedirect(auth, provider);
      } else {
        try {
          await signInWithPopup(auth, provider);
        } catch (err: any) {
          if (
            err.code === 'auth/popup-blocked' || 
            err.code === 'auth/popup-closed-by-user' || 
            err.code === 'auth/unauthorized-domain' || 
            err.code === 'auth/web-storage-unsupported'
          ) {
            await signInWithRedirect(auth, provider);
          } else {
            throw err;
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Accesso annullato.');
      } else if (err.code === 'auth/unauthorized-domain') {
         setError('Dominio non autorizzato in Firebase. Aggiungilo nella console.');
      } else {
        setError(err.message || 'Errore durante l\'accesso con Google.');
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('Email o password non validi.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Questa email è già in uso.');
      } else {
        setError(err.message || 'Errore durante l\'autenticazione.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-slate-100 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-3xl p-8 shadow-2xl flex flex-col items-center card-3d">
        <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/30 ring-1 ring-white/10 mb-6">
          <CalendarDays className="w-8 h-8 text-white drop-shadow-md" />
        </div>
        <h1 className="font-display font-black text-4xl tracking-tighter text-white text-3d leading-none mb-2">OneLife</h1>
        <p className="text-xs tracking-[0.2em] font-bold text-indigo-400 uppercase mb-8" style={{ textShadow: 'none' }}>Manager</p>
        
        <form onSubmit={handleEmailAuth} className="w-full space-y-4 mb-6">
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-lg">
             {isRegistering ? 'Registrati' : 'Accedi con Email'}
          </Button>

          <div className="text-center text-sm text-slate-400">
            {isRegistering ? 'Hai già un account?' : 'Non hai un account?'}
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-2 text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              {isRegistering ? 'Accedi' : 'Registrati'}
            </button>
          </div>
        </form>

        <div className="w-full relative flex items-center justify-center mb-6">
          <div className="w-full h-px bg-slate-800 absolute"></div>
          <span className="bg-slate-900 px-3 text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">Oppure</span>
        </div>

        <div className="w-full space-y-4">
          <Button type="button" variant="outline" onClick={handleGoogleLogin} className="w-full h-12 text-lg bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 border-transparent">
             <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
             </svg>
             Accedi con Google
          </Button>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}

