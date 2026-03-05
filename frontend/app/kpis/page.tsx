"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '../../lib/apiClient';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { format, subDays, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, TrendingUp, CheckCircle, AlertCircle, Filter } from 'lucide-react';

const USERS = ['Ana', 'Claudia', 'Fran', 'Gra', 'Ilonka', 'Josue', 'Lina', 'Paty', 'Pauli', 'Sascha'];

export default function KPIsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState(searchParams.get('user') || USERS[0]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    const fetchAll = async () => {
      // In a real app, we'd have a stats endpoint. 
      // For now, we'll fetch tasks for the user and filter.
      // Note: This is a simplification.
      const data = await apiClient.get(`/api/tasks/${selectedUser}/2026-03-04`); // Mocking for now
      setTasks(data);
    };
    fetchAll();
  }, [selectedUser]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b p-4 flex items-center gap-4">
        <button onClick={() => router.back()}><ArrowLeft/></button>
        <h1 className="font-bold text-xl">KPIs de {selectedUser}</h1>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="bg-white p-6 rounded-2xl border flex gap-4">
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            className="p-2 border rounded-lg"
          >
            {USERS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase">Cumplimiento</div>
            <div className="text-3xl font-bold text-[#001664]">85%</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase">Días Perfectos</div>
            <div className="text-3xl font-bold text-[#28a745]">4</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase">Atraso Crítico</div>
            <div className="text-3xl font-bold text-[#E60019]">1</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border h-80">
          <h3 className="font-bold mb-4">Cumplimiento por Categoría</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Críticas', value: 90, color: '#001664' },
              { name: 'Admin', value: 75, color: '#E60019' },
              { name: 'Micro', value: 100, color: '#28a745' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                { [0,1,2].map((_, i) => <Cell key={i} fill={['#001664', '#E60019', '#28a745'][i]} />) }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
