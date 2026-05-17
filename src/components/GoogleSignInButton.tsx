'use client';

import { useEffect, useState } from 'react';
import {
  GoogleAuthState,
  isGoogleConfigured,
  initGoogleAuth,
  addAuthListener,
  getAuthState,
  signIn,
  signOut,
} from '@/lib/googleAuth';

interface Props {
  variant?: 'light' | 'dark';
}

export default function GoogleSignInButton({ variant = 'light' }: Props) {
  const [auth, setAuth] = useState<GoogleAuthState>(getAuthState());

  useEffect(() => {
    if (!isGoogleConfigured()) return;
    initGoogleAuth();
    return addAuthListener(setAuth);
  }, []);

  if (!isGoogleConfigured()) return null;

  const isDark = variant === 'dark';

  if (!auth.isInitialized) {
    return (
      <div className={`h-9 w-28 rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-ink-50 border border-ink-200'}`} />
    );
  }

  if (auth.isSignedIn) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        {auth.userPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={auth.userPhoto}
            alt={auth.userName ?? ''}
            title={auth.userEmail ?? ''}
            className="w-7 h-7 rounded-full ring-2 ring-accent/30 shrink-0"
          />
        ) : (
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${isDark ? 'bg-white/20 text-white' : 'bg-accent-soft text-accent-ink'}`}>
            {(auth.userName ?? auth.userEmail ?? '?')[0].toUpperCase()}
          </div>
        )}
        <span className={`text-[12px] hidden lg:inline max-w-[120px] truncate ${isDark ? 'text-white/80' : 'text-ink-700'}`}>
          {auth.userName || auth.userEmail}
        </span>
        <button
          onClick={signOut}
          className={`h-9 px-3 text-[12px] rounded-lg transition-colors shrink-0 ${
            isDark
              ? 'border border-white/20 text-white/60 hover:border-white/40 hover:text-white'
              : 'border border-ink-200 text-ink-600 hover:border-ink-400 hover:text-ink-900'
          }`}
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signIn}
      className={`h-9 px-3 flex items-center gap-2 text-[12px] font-semibold rounded-lg transition-colors shrink-0 ${
        isDark
          ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
          : 'bg-surface border border-ink-200 text-ink-700 hover:border-ink-400 hover:bg-ink-50'
      }`}
    >
      <GoogleIcon />
      Googleでログイン
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
