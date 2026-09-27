import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  FlaskConical,
  Database,
  History,
  FileText,
  Sun,
  Moon,
  Laptop,
  Shield,
  User,
  Menu,
  X,
  Play,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useTheme, ThemeMode } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
  onRunDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenAuth,
  onRunDemo,
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user, isAdmin, logout, toggleAdminRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'new-analysis', label: 'New Analysis', icon: Sparkles },
    { id: 'materials', label: 'Materials', icon: Database },
    { id: 'history', label: 'History', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  if (isAdmin) {
    navLinks.push({ id: 'admin', label: 'Admin Lab', icon: Shield });
  }

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => handleNav('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform duration-200">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    PACKWISE<span className="text-emerald-600 dark:text-emerald-400">.AI</span>
                  </span>
                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-300/40 dark:border-emerald-700/40">
                    2.0
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-none tracking-tight">
                  Smart Packaging Decisions
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentPage === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNav(link.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 shadow-sm border border-emerald-200/60 dark:border-emerald-800/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Demo Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRunDemo}
              className="text-xs font-medium border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
            >
              <Play className="w-3.5 h-3.5 fill-current text-emerald-600 dark:text-emerald-400" />
              Try Demo
            </Button>

            {/* Theme Toggle Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                aria-label="Toggle Theme"
              >
                {resolvedTheme === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </button>

              {themeDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-36 py-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 text-xs font-medium"
                  onMouseLeave={() => setThemeDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      setTheme('light');
                      setThemeDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      theme === 'light' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" /> Light
                  </button>
                  <button
                    onClick={() => {
                      setTheme('dark');
                      setThemeDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      theme === 'dark' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" /> Dark
                  </button>
                  <button
                    onClick={() => {
                      setTheme('system');
                      setThemeDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      theme === 'system' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" /> System
                  </button>
                </div>
              )}
            </div>

            {/* Auth / Profile Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[110px] truncate">{user.fullName || user.email}</span>
                  {isAdmin && (
                    <Badge variant="cyan" className="text-[9px] px-1.5 py-0">
                      ADMIN
                    </Badge>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 text-xs"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{user.fullName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        toggleAdminRole();
                        setUserDropdownOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-cyan-500" /> Admin Mode
                      </span>
                      <span className={`text-[10px] px-1.5 rounded ${isAdmin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        {isAdmin ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button size="sm" onClick={onOpenAuth} className="text-xs">
                <User className="w-3.5 h-3.5 mr-1" />
                Sign In
              </Button>
            )}

            {/* Primary Action: New Analysis */}
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleNav('new-analysis')}
              className="text-xs hidden lg:flex font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              New Analysis
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={() => { onRunDemo(); setMobileMenuOpen(false); }} className="w-full justify-center">
              <Play className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Run Chilled Tomato Demo
            </Button>
            {user ? (
              <Button variant="secondary" size="sm" onClick={logout} className="w-full justify-center text-rose-600 dark:text-rose-400">
                <LogOut className="w-3.5 h-3.5 mr-1" /> Sign Out ({user.fullName || user.email})
              </Button>
            ) : (
              <Button size="sm" onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }} className="w-full justify-center">
                Sign In / Sign Up
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
