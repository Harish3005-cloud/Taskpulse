import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-8">
        
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <svg 
              width="22" 
              height="22" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-foreground"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M6 14l6-6" />
              <path d="M10 18l8-8" />
            </svg>
            <span className="font-semibold text-[15px] tracking-tight text-foreground">
              TaskPulse
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-[13px] font-medium text-muted-foreground">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
              <Link to="/dashboard" className="hover:text-foreground transition-colors">Workspaces</Link>
              <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            </>
          ) : (
            <>
              <Link to="/product" className="hover:text-foreground transition-colors">Product</Link>
              <Link to="/resources" className="hover:text-foreground transition-colors">Resources</Link>
              <Link to="/customers" className="hover:text-foreground transition-colors">Customers</Link>
              <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/now" className="hover:text-foreground transition-colors">Now</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </>
          )}
        </nav>

        {/* Right: Auth */}
        <div className="flex items-center gap-5">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:block text-[13px] font-medium text-muted-foreground">
                {user?.name}
              </span>
              <div className="hidden sm:block h-3 w-[1px] bg-border"></div>
              <button 
                onClick={handleLogout}
                className="inline-flex h-[28px] items-center justify-center rounded-full bg-foreground px-3.5 text-[12px] font-medium text-background hover:bg-foreground/90 transition-colors cursor-pointer"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                Log in
              </Link>
              <div className="hidden sm:block h-3 w-[1px] bg-border"></div>
              <Link to="/signup" className="inline-flex h-[28px] items-center justify-center rounded-full bg-foreground px-3.5 text-[12px] font-medium text-background hover:bg-foreground/90 transition-colors">
                Sign up
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
