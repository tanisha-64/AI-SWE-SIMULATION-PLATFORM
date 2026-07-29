import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import UserMenu from './UserMenu';
import {
  Sun, Moon, Code2, LayoutDashboard, ListChecks, Bug,
  MessageSquareText, Menu, X, TrendingUp, Flame, HelpCircle,
  Crown, FileText,
} from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/problems', label: 'Problems', icon: ListChecks },
    { path: '/debug-arena', label: 'Debug Arena', icon: Bug },
    { path: '/daily-challenge', label: 'Daily', icon: Flame },
    { path: '/career-tracks', label: 'Careers', icon: TrendingUp },
    { path: '/mentor', label: 'Mentor', icon: MessageSquareText },
    { path: '/resume', label: 'Resume', icon: FileText },
    { path: '/pricing', label: 'Pricing', icon: Crown },
    { path: '/contact', label: 'Help', icon: HelpCircle },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-dark-card/80 backdrop-blur-lg border-b border-dark-border">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-2">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <div className="bg-primary/20 p-1.5 rounded-lg">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          <span className="hidden sm:inline">CodeMentor AI</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className="relative px-3 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1.5"
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                <span className={isActive ? 'text-primary font-semibold' : 'text-gray-400 hover:text-white transition-colors'}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-purple-500 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileTap={{ scale: 0.9, rotate: 180 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-dark-border transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </motion.button>

          <div className="hidden lg:block">
            <UserMenu />
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-dark-border transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-t border-dark-border"
          >
            <div className="px-4 py-2 space-y-1 max-h-[70vh] overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-dark-border hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-dark-border hover:text-white transition-colors"
              >
                <Code2 className="w-4 h-4" />
                My Profile
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}