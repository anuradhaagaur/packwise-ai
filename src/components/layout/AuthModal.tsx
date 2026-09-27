import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Shield, Sparkles, User, Lock, Mail, ArrowRight } from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Email is required');
      return;
    }

    setLoading(true);
    if (mode === 'login') {
      const res = await login(email, password || undefined);
      setLoading(false);
      if (res.success) {
        success('Signed in successfully', `Welcome back, ${email}`);
        onClose();
      } else {
        error('Sign in failed', res.error);
      }
    } else {
      const res = await signup(email, password || undefined, fullName || undefined);
      setLoading(false);
      if (res.success) {
        success('Account created', `Welcome to PACKWISE AI, ${email}`);
        onClose();
      } else {
        error('Sign up failed', res.error);
      }
    }
  };

  const handleQuickDemoAdmin = async () => {
    setLoading(true);
    await login('admin.director@packwise.ai', 'admin123');
    setLoading(false);
    success('Logged in as Lab Admin', 'Full access to commodities, materials catalog, and system analytics enabled.');
    onClose();
  };

  const handleQuickDemoResearcher = async () => {
    setLoading(true);
    await login('researcher@packwise.ai', 'user123');
    setLoading(false);
    success('Logged in as Food Packaging Scientist', 'Ready to run analyses and export reports.');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Sign in to PACKWISE AI' : 'Create PACKWISE Account'}
      description="Access your saved analyses, custom commodities, and technical reports across devices."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <Input
            label="Full Name / Organisation"
            placeholder="Dr. Elena Vance / AgriFood Labs"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}

        <Input
          label="Work Email Address"
          type="email"
          placeholder="scientist@foodcorp.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" loading={loading} className="w-full text-sm font-semibold mt-2">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>

        {/* Mode Switcher */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Sign Up Free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

        {/* Quick Demo Instant Logins */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center">
            One-Click Instant Roles
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickDemoResearcher}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors font-medium"
            >
              <User className="w-3.5 h-3.5 text-emerald-500" /> Researcher Role
            </button>
            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-cyan-300/40 dark:border-cyan-800/60 bg-cyan-50/50 hover:bg-cyan-100/50 dark:bg-cyan-950/30 dark:hover:bg-cyan-900/40 text-xs text-cyan-800 dark:text-cyan-300 transition-colors font-semibold"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-500" /> Lab Admin Role
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
