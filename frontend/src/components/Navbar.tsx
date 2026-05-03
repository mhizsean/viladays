import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-base font-medium text-gray-900">
          VilaDays
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            to="/"
            className={
              isActive("/")
                ? "text-gray-900 font-medium"
                : "text-gray-400 hover:text-gray-600"
            }
          >
            Explore
          </Link>
          <Link
            to="/my-plan"
            className={
              isActive("/my-plan")
                ? "text-gray-900 font-medium"
                : "text-gray-400 hover:text-gray-600"
            }
          >
            My plan
          </Link>
          <Link
            to="/calendar"
            className={
              isActive("/calendar")
                ? "text-gray-900 font-medium"
                : "text-gray-400 hover:text-gray-600"
            }
          >
            Calendar
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={
                isActive("/admin")
                  ? "text-gray-900 font-medium"
                  : "text-gray-400 hover:text-gray-600"
              }
            >
              Admin
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{user?.first_name}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
