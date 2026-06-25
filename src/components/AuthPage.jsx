import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignup = location.pathname === '/signup';
  const [isEmailView, setIsEmailView] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, loading, isAuthenticated } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !name) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(email, name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/v1/auth/google';
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#000000] text-white">
      
      {/* Container */}
      <div className="w-full max-w-[380px] flex flex-col items-center px-6">
        
        {/* Logo */}
        <Link to="/" className="mb-8 hover:opacity-80 transition-opacity">
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-white"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M6 14l6-6" />
            <path d="M10 18l8-8" />
          </svg>
        </Link>

        {isEmailView ? (
          <>
            {/* Email View Title */}
            <h1 className="text-[18px] font-medium mb-6 tracking-tight">
              What's your email address?
            </h1>

            {/* Dev mode notice */}
            <div className="w-full mb-4 flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] text-[#d97706] bg-[#d97706]/10 border border-[#d97706]/20">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                <path d="M8 1L1 15H15L8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 6V9M8 11.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Dev mode — enter any email &amp; name to sign in</span>
            </div>

            <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-3">
              <input 
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111111] border border-[#2a2a2a] rounded-md px-4 py-3 text-[14px] text-white placeholder-[#666666] focus:outline-none focus:border-[#5e6ad2] transition-colors"
              />
              <input 
                type="email" 
                placeholder="Enter your email address..." 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111111] border border-[#2a2a2a] rounded-md px-4 py-3 text-[14px] text-white placeholder-[#666666] focus:outline-none focus:border-[#5e6ad2] transition-colors"
                autoFocus
              />

              {error && (
                <p className="text-[12px] text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222222] text-white border border-[#2a2a2a] rounded-full py-[10px] text-[14px] font-medium transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  'Continue with email'
                )}
              </button>

              <button 
                type="button"
                onClick={() => { setIsEmailView(false); setError(''); }}
                className="text-[12px] text-[#888888] hover:text-white transition-colors mt-2"
              >
                Back to {isSignup ? 'signup' : 'login'}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Default View Title */}
            <h1 className="text-[22px] font-semibold mb-8 tracking-tight">
              {isSignup ? 'Create your workspace' : 'Log in to TaskPulse'}
            </h1>

            {/* Buttons */}
            <div className="w-full flex flex-col gap-3">
              
              <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-[#5e6ad2] hover:bg-[#6c78df] text-white rounded-full py-[10px] text-[14px] font-medium transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              {isSignup && (
                <p className="text-[#888888] text-[12px] text-center my-1">
                  You used Google to log in last time
                </p>
              )}

              <button 
                onClick={() => setIsEmailView(true)}
                className="w-full flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222222] text-white border border-[#2a2a2a] rounded-full py-[10px] text-[14px] font-medium transition-colors"
              >
                Continue with email
              </button>

              <button className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#222222] text-white border border-[#2a2a2a] rounded-full py-[10px] text-[14px] font-medium transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                Continue with GitHub
              </button>

            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
              <p className="text-[#666666] text-[11px] leading-relaxed max-w-[280px] mx-auto mb-4">
                By signing up, you agree to our <a href="#" className="text-[#888888] hover:text-white transition-colors">Terms of Service</a> and <a href="#" className="text-[#888888] hover:text-white transition-colors">Data Processing Agreement</a>.
              </p>
              <p className="text-[#888888] text-[12px]">
                {isSignup ? (
                  <>Already have an account? <Link to="/login" className="text-white hover:underline font-medium">Log in</Link></>
                ) : (
                  <>Don't have an account? <Link to="/signup" className="text-white hover:underline font-medium">Sign up</Link></>
                )}
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
