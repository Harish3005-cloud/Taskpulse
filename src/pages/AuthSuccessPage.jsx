import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const { handleOAuthSuccess } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        let user;
        if (userStr.startsWith('{')) {
           user = JSON.parse(userStr);
        } else {
           user = JSON.parse(decodeURIComponent(userStr));
        }
        
        handleOAuthSuccess(token, user);
        
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1000);
        
      } catch (e) {
        console.error('Failed to parse user from OAuth callback', e);
        setErrorMsg('Error parsing login data: ' + e.message);
      }
    } else {
        setErrorMsg('Missing token or user data in URL.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#000000] text-white px-6">
      
      {/* Logo */}
      <Link to="/" className="mb-8">
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M6 14l6-6" />
          <path d="M10 18l8-8" />
        </svg>
      </Link>

      {!errorMsg ? (
        <>
          {/* Spinner */}
          <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-[#5e6ad2] rounded-full animate-spin mb-6"></div>
          <h2 className="text-[18px] font-medium tracking-tight mb-2">Authenticating...</h2>
          <p className="text-[#888888] text-[13px]">Please wait while we log you in.</p>
          
          {/* Fallback button */}
          <button 
            onClick={() => window.location.href = '/dashboard'} 
            className="mt-8 inline-flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222222] text-white border border-[#2a2a2a] rounded-full px-6 py-[10px] text-[13px] font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </>
      ) : (
        <>
          <h2 className="text-[18px] font-medium tracking-tight mb-4">Authentication Error</h2>
          <p className="text-[#ef4444] text-[13px] bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg px-4 py-3 max-w-[400px] text-center mb-6">
            {errorMsg}
          </p>
          <Link 
            to="/login"
            className="inline-flex items-center justify-center bg-[#5e6ad2] hover:bg-[#6c78df] text-white rounded-full px-6 py-[10px] text-[13px] font-medium transition-colors"
          >
            Back to Login
          </Link>
        </>
      )}

    </div>
  );
}
