'use client';

import AdminSidebar from '@/components/Sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Student {
  id: number;
  name: string;
  roll_number: string;
}

export default function ViewStudents() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 15;

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) router.push('/admin/login');
  }, [router]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/get_student?page=${page}&limit=${limit}`);
        const data = await res.json();
        setStudents(data.students);
        setFilteredStudents(data.students);
        setTotal(data.total);
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredStudents(students);
    } else {
      const lower = query.toLowerCase();
      const filtered = students.filter(
        (s) =>
          s.name.toLowerCase().includes(lower) ||
          s.roll_number.toLowerCase().includes(lower)
      );
      setFilteredStudents(filtered);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <AdminSidebar />

      <main className="flex-1 p-6 bg-gradient-to-br from-blue-100 to-purple-200 transition-all duration-300 pt-20 md:pt-10">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">All Registered Students</h1>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or roll number..."
            className="w-full max-w-sm mb-6 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full table-auto border rounded-xl">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Roll Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr key={student.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{(page - 1) * limit + index + 1}</td>
                        <td className="px-4 py-3">{student.name}</td>
                        <td className="px-4 py-3">{student.roll_number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
