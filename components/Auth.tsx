import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, resetPassword } from '../services/dbService';
import { Mail, ArrowRight, Loader2, School, Lock, Key } from 'lucide-react';
import { UserRole } from '../types';

interface AuthProps {
  onLogin: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    return email.toLowerCase().endsWith('@aui.ma');
  };

  const handleForgotPassword = () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
        resetPassword(email);
        setSuccessMsg('Password reset link has been sent to your email.');
        setLoading(false);
        setError('');
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      try {
        if (!validateEmail(email)) {
          throw new Error('Please use your official @aui.ma email address.');
        }

        if (isLogin) {
          const user = loginUser(email, password);
          onLogin(user);
          // Auto-redirect based on Role
          if (user.role === UserRole.ADMIN) {
            navigate('/admin');
          } else {
            navigate('/home');
          }
        } else {
          // Registration Validation
          if (password.length < 6) throw new Error('Password must be at least 6 characters.');
          if (password !== confirmPassword) throw new Error('Passwords do not match.');
          if (!fullName.trim()) throw new Error('Full Name is required.');
          if (!major) throw new Error('Please select your major.');

          const newUser = registerUser({
            email,
            fullName,
            major,
            yearOfStudy: 'Freshman', // Default for MVP
            purposes: [],
            interests: [],
            bio: '',
          }, password);
          onLogin(newUser);
          navigate('/setup'); // Go to profile setup
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary-200 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-secondary-200 rounded-full blur-3xl opacity-30" />

      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4 shadow-lg shadow-primary-500/30">
            <School className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">UniMates</h1>
          <p className="text-slate-500 mt-2">Find your tribe at Al Akhawayn.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-2 border border-red-100">
              <span>•</span> {error}
            </div>
          )}
          
          {successMsg && (
            <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl flex items-start gap-2 border border-green-100">
              <span>✓</span> {successMsg}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-4 animate-slide-up">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white/50"
                  placeholder="Youssef Ben..."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Major</label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white/50"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                >
                  <option value="">Select Major</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business Administration">Business Admin</option>
                  <option value="International Studies">International Studies</option>
                  <option value="Communication">Communication</option>
                  <option value="Human Resource Development">HRD</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">University Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white/50"
                placeholder="id@aui.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {!isLogin && (
             <div className="animate-slide-up">
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white/50"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-semibold py-4 rounded-xl shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {isLogin ? 'Sign In' : 'Join Community'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2">
          {isLogin && (
            <button
                type="button"
                onClick={handleForgotPassword}
                className="text-slate-500 text-sm hover:text-slate-800 transition-colors"
            >
                Forgot Password?
            </button>
          )}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}
            className="text-primary-600 font-medium hover:underline text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
      
      <p className="absolute bottom-6 text-slate-400 text-xs text-center">
        Secure & Private • AUI Students Only
      </p>
    </div>
  );
};

export default Auth;