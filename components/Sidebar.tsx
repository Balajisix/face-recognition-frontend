'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, UserPlus2, Users, BarChart3, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setOpen(prev => !prev)}
          className="bg-blue-700 text-white p-2 rounded-full shadow-lg"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay (click to close) */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
  className={`
    bg-blue-700 text-white w-64 p-6 space-y-6 h-screen
    md:static fixed top-0 left-0 z-40
    transition-transform duration-300 ease-in-out
    ${open ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0
  `}
>


        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="flex flex-col gap-6 text-lg">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 hover:underline"
            onClick={() => setOpen(false)}
          >
            <BarChart3 className="w-5 h-5" /> Dashboard Summary
          </Link>
          <Link
            href="/admin/register"
            className="flex items-center gap-3 hover:underline"
            onClick={() => setOpen(false)}
          >
            <UserPlus2 className="w-5 h-5" /> Register Face
          </Link>
          <Link
            href="/admin/students"
            className="flex items-center gap-3 hover:underline"
            onClick={() => setOpen(false)}
          >
            <Users className="w-5 h-5" /> View Students
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 hover:underline text-left"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </nav>
      </aside>
    </>
  );
}
