'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard, Newspaper, Megaphone, Bell,
  LogOut, Menu, X, ChevronLeft
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/articles', label: 'الأخبار', icon: Newspaper },
  { href: '/ads', label: 'الإعلانات', icon: Megaphone },
  { href: '/notifications', label: 'الإشعارات', icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج');
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className={`flex flex-col h-full bg-gray-900 border-l border-gray-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-white">ايام كناوية</h1>
            <p className="text-xs text-emerald-400">لوحة الإدارة</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors hidden lg:block"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-emerald-400' : ''}`} />
              {!collapsed && <span className="text-sm">{label}</span>}
              {active && !collapsed && (
                <span className="mr-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-gray-800">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-white">{admin?.username}</p>
            <p className="text-xs text-gray-500">{admin?.role === 'superadmin' ? 'مدير عام' : 'محرر'}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-400"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed top-0 right-0 h-full z-40 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block h-full">
        <SidebarContent />
      </div>
    </>
  );
}
