'use client';

import AdminSidebar from '@/components/Sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Student {
  status: 'present' | 'absent';
}

export default function AdminDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) router.push('/login');
  }, [router]);

  useEffect(() => {
    fetch('http://localhost:5000/api/graph_data')
      .then(res => res.json())
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch students:', err);
        setLoading(false);
      });
  }, []);

  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.length - presentCount;

  const chartData = [
    { name: 'Present', count: presentCount },
    { name: 'Absent', count: absentCount },
  ];

return (
  <div className="min-h-screen flex flex-col md:flex-row relative overflow-x-hidden">
    <AdminSidebar />

    <main
      className={`
        flex-1 p-6 bg-gradient-to-br from-blue-100 to-purple-200 transition-all duration-300
        pt-20 md:pt-10
      `}
    >
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Dashboard Summary</h1>

        <div className="mb-6">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-blue-100 p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold">Total Students</h2>
            <p className="text-3xl font-bold">{students.length}</p>
          </div>
          <div className="bg-green-100 p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold">Present Today</h2>
            <p className="text-3xl font-bold">{presentCount}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
);

}
