import { ReactNode, useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  to: string;
}

function getNavItems(role: string): NavItem[] {
  if (role === 'Admin') {
    return [{ label: 'All Products', to: '/admin/products' }];
  }
  return [
    { label: 'My Products', to: '/user/products' },
    { label: 'New Product', to: '/user/products/new' },
  ];
}

function NavItems({ items, onClick }: { items: NavItem[]; onClick?: () => void }) {
  return (
    <>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          onClick={onClick}
          className={({ isActive }) =>
            `block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const navItems = user ? getNavItems(user.role) : [];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    if (!drawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        hamburgerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  useEffect(() => {
    if (drawerOpen && drawerRef.current) {
      const firstFocusable = drawerRef.current.querySelector<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target as Node)
      ) {
        setDrawerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [drawerOpen]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-gray-200 z-30">
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-8">
            <span className="text-lg font-bold text-primary-600">Product System</span>
          </div>

          {user && (
            <div className="mb-6 px-4 py-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Signed in as</p>
              <p className="mt-1 text-sm font-semibold text-gray-800 truncate">{user.email || '—'}</p>
              <Badge label={user.role || 'User'} variant="info" size="sm" dot={false} />
            </div>
          )}

          <nav className="flex flex-col gap-1 flex-1">
            <NavItems items={navItems} />
          </nav>

          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-14 flex items-center px-4">
        <Button
          ref={hamburgerRef}
          variant="ghost"
          size="sm"
          onClick={() => setDrawerOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={drawerOpen}
          aria-controls="mobile-drawer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {drawerOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </Button>
        <span className="ml-3 text-base font-bold text-primary-600">Product System</span>
      </header>

      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40 transition-opacity"
          aria-hidden="true"
        />
      )}

      <div
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`md:hidden fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-base font-bold text-primary-600">Product System</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeDrawer}
              aria-label="Close navigation menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {user && (
            <div className="mb-6 px-4 py-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Signed in as</p>
              <p className="mt-1 text-sm font-semibold text-gray-800 truncate">{user.email || '—'}</p>
              <Badge label={user.role || 'User'} variant="info" size="sm" dot={false} />
            </div>
          )}

          <nav className="flex flex-col gap-1 flex-1">
            <NavItems items={navItems} onClick={closeDrawer} />
          </nav>

          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => { closeDrawer(); handleLogout(); }}
              className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <main className="flex-1 md:ml-64 pt-14 md:pt-0 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
