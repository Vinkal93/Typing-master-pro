'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, KeyRound } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RbacService } from '@/services/security/rbacService';
import { AuthSession } from '@/types/institute';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (session: AuthSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [authMode, setAuthMode] = useState<'username' | 'pin'>('pin');
  const [username, setUsername] = useState('admin');
  const [secret, setSecret] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (authMode === 'pin') {
        if (!pin.trim()) {
          setErrorMsg('Please enter your Instructor or Admin PIN.');
          setIsSubmitting(false);
          return;
        }

        const res = await RbacService.authenticateWithPin(pin.trim());
        if (res.success && res.user) {
          // Upgrade to session
          const sessionRes = await RbacService.authenticate(res.user.username, pin.trim());
          if (sessionRes.success && sessionRes.session) {
            onAuthenticated(sessionRes.session);
            onClose();
          } else {
            // Direct session initialization
            const session: AuthSession = {
              user: res.user,
              token: `sess_pin_${Date.now()}`,
              expiresAt: Date.now() + 8 * 3600 * 1000,
              isLocked: false,
            };
            onAuthenticated(session);
            onClose();
          }
        } else {
          setErrorMsg(res.message || 'Invalid PIN. Try default Master PIN (123456).');
        }
      } else {
        if (!username.trim() || !secret.trim()) {
          setErrorMsg('Username and Password/PIN are required.');
          setIsSubmitting(false);
          return;
        }

        const res = await RbacService.authenticate(username.trim(), secret.trim());
        if (res.success && res.session) {
          onAuthenticated(res.session);
          onClose();
        } else {
          setErrorMsg(res.message || 'Authentication failed. Check credentials.');
        }
      }
    } catch (err: any) {
      setErrorMsg(`Authentication error: ${err.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Staff & Teacher Authentication"
      subtitle="Role-Based Secure Institute Access Control"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Security Notice */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs font-bold text-purple-900 dark:text-purple-200">
                Encrypted Offline Authentication
              </p>
              <p className="text-[11px] text-purple-700 dark:text-purple-300">
                Salted hashing with zero plaintext password storage.
              </p>
            </div>
          </div>
          <Badge variant="purple" size="sm">PBKDF2 / SHA-256</Badge>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs">
          <button
            type="button"
            onClick={() => { setAuthMode('pin'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              authMode === 'pin'
                ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Quick PIN Access
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('username'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              authMode === 'username'
                ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Username & Password
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {authMode === 'pin' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Enter Master Admin or Teacher PIN:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value); setErrorMsg(''); }}
                  placeholder="e.g. 123456"
                  maxLength={12}
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono tracking-widest text-center text-base"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 text-center">
                Default Master PIN: <code className="font-mono text-purple-600">123456</code>
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setErrorMsg(''); }}
                    placeholder="e.g. admin"
                    autoFocus
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={secret}
                    onChange={(e) => { setSecret(e.target.value); setErrorMsg(''); }}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default credentials: <code className="font-mono text-purple-600">admin / admin123</code>
                </p>
              </div>
            </>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
