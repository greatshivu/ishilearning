import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X } from 'lucide-react';
import { toast } from "sonner";
import { useIdleLogout } from '../services/useIdleLogout';
import logoImage from "../assets/logo.svg" ;

export function Nav() {
  return <img src={logoImage} alt="icon" width="64" height="64"  />;
}

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const FIFTEEN_MIN = 15 * 60 * 1000;

  const handleLogout = () => {
    doLogout("");
  };

   const doLogout = (reason: string) => {
    logout();
    if (reason) toast.info(reason);
    navigate('/');
  };

  useIdleLogout({
    timeoutMs: FIFTEEN_MIN,
    warnBeforeMs: 60_000,
    enabled: !!user,
    onWarning: () => toast.warning("You will be logged out in 1 minute due to inactivity."),
    onLogout: () => doLogout("Logged out due to inactivity."),
  });
  

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center text-2xl font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
          <Nav/>Shiva's Blog
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium hover:text-blue-500">Home</Link>
          {user ? (
            <>
              <Link to="/videos" className="text-sm font-medium hover:text-blue-500">Videos</Link>
              <Link to="/snippets" className="text-sm font-medium hover:text-blue-500">Snippets</Link>
              <Link to="/repos" className="text-sm font-medium hover:text-blue-500">Repos</Link>
              <Link to="/blogs" className="text-sm font-medium hover:text-blue-500">Blogs</Link>
              <Link to="/dictionary" className="text-sm font-medium hover:text-blue-500">Dictionary</Link>
              <Link to="/feedback" className="text-sm font-medium hover:text-blue-500">Feedback</Link>
              {user.roles.includes('Admin') && (
                <Link to="/admin" className="text-sm font-bold text-red-500 hover:text-red-600">Admin</Link>
              )}
              <div className="flex items-center gap-4 border-l pl-8 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">{user.fullName}</span>
                <Link to="/profile" className="text-gray-500 hover:text-blue-500 transition-colors">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t bg-white p-4 dark:border-gray-700 dark:bg-gray-900 md:hidden">
          <div className="flex flex-col gap-4">
            <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
            {user ? (
              <>
                <Link to="/videos" onClick={() => setIsOpen(false)}>Videos</Link>
                <Link to="/snippets" onClick={() => setIsOpen(false)}>Snippets</Link>
                <Link to="/repos" onClick={() => setIsOpen(false)}>Repos</Link>
                <Link to="/blogs" onClick={() => setIsOpen(false)}>Blogs</Link>
                <Link to="/dictionary" onClick={() => setIsOpen(false)}>Dictionary</Link>
                {user.roles.includes('Admin') && (
                  <Link to="/admin" className="font-bold text-red-500" onClick={() => setIsOpen(false)}>Admin</Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-500">
                  <LogOut size={20} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
