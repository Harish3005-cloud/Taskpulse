import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);
  const autoAcceptAttempted = useRef(false);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const { data } = await api.get(`/invites/${token}`);
        setInvite(data.invite);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Invalid or expired invitation link.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [token]);

  // Auto-accept invite when user is already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && invite && !autoAcceptAttempted.current && !accepting) {
      autoAcceptAttempted.current = true;
      handleAccept();
    }
  }, [isAuthenticated, authLoading, invite]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const { data } = await api.post(`/invites/${token}/accept`);
      navigate(`/dashboard/${data.project.workspaceId}/projects/${data.project._id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to accept invitation.');
      setAccepting(false);
    }
  };

  const handleContinueToSignup = () => {
    sessionStorage.setItem('tp-invite-token', token);
    navigate(`/signup?email=${encodeURIComponent(invite.email)}`);
  };

  if (loading || authLoading || accepting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#000000] text-white gap-4">
        <div className="w-8 h-8 border-4 border-[#2a2a2a] border-t-white rounded-full animate-spin"></div>
        {accepting && <p className="text-[#888888] text-sm">Accepting invitation...</p>}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#000000] text-white px-6">
        <div className="w-full max-w-[400px] text-center">
          <div className="w-12 h-12 rounded-full bg-[#ef4444]/10 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-[20px] font-semibold mb-2">Invitation Error</h1>
          <p className="text-[#888888] mb-8">{error}</p>
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="text-[14px] text-white hover:underline">
            {isAuthenticated ? "Go to Dashboard" : "Return to Home"}
          </Link>
        </div>
      </div>
    );
  }

  // Only show the manual accept UI for unauthenticated users
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#000000] text-white px-6">
      <div className="w-full max-w-[400px] bg-[#111111] border border-[#2a2a2a] rounded-xl p-8 text-center shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-[#5e6ad2]/10 flex items-center justify-center mx-auto mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5e6ad2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5.5" />
            <path d="M8.5 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        
        <h1 className="text-[24px] font-semibold mb-2 tracking-tight">You've been invited!</h1>
        <p className="text-[#888888] text-[15px] leading-relaxed mb-8">
          <strong className="text-white font-medium">{invite.invitedBy.name}</strong> has invited you to collaborate on the project <strong className="text-white font-medium">{invite.project.name}</strong>.
        </p>

        {isAuthenticated ? (
          <button 
            onClick={handleAccept}
            disabled={accepting}
            className="w-full flex items-center justify-center bg-[#5e6ad2] hover:bg-[#6c78df] text-white rounded-full py-[12px] text-[15px] font-medium transition-colors disabled:opacity-50"
          >
            {accepting ? 'Accepting...' : 'Accept Invitation'}
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleContinueToSignup}
              className="w-full flex items-center justify-center bg-[#5e6ad2] hover:bg-[#6c78df] text-white rounded-full py-[12px] text-[15px] font-medium transition-colors"
            >
              Sign up to accept
            </button>
            <p className="text-[13px] text-[#888888] mt-2">
              Already have an account? <Link to={`/login?inviteToken=${token}`} className="text-white hover:underline">Log in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

