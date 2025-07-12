"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BASE_URL from "@/utils/api";

export default function AdminLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async(e: React.FormEvent) => {
    e.preventDefault();
    setError('')

    const res = await fetch(`${BASE_URL}/api/auth/admin_login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if(res.ok) {
      localStorage.setItem('admin_token', 'logged_in');
      router.push('/admin/dashboard')
    } else {
      setError(data.error || 'Login Failed');
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-center text-black">Admin Login</h2>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 border rounded mb-3"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded mb-3"
        required
      />
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
      >
        Login
      </button>
    </form>
  );
}

