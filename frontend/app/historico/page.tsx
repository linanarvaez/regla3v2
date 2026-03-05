"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/apiClient';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, History, Users } from 'lucide-react';

export default function HistoricoPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.get('/api/tasks/stats/global');
        const formatted = data.map((d: any) => ({
          ...d,
          formattedDate: format(parseISO(d.date), 'dd MMM', { locale: es }),
          compliance: Math.round((d.completed / d.total) * 100)
        })).sort((a: any, b: any) => a.date.localeCompare(b.date));
        setStats(formatted);
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b p-4 flex items-center gap-4">
        <button onClick={() => router.back()}><ArrowLeft/></button>
        <h1 className="font-bold text-xl">Histórico Global</h1>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#001664]/10 rounded-2xl text-[#001664]">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Cumplimiento Ponderado</h2>
              <p className="text-slate-500 text-sm">Rendimiento consolidado de todos los usuarios.</p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="formattedDate" />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="compliance" 
                  stroke="#001664" 
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#001664' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-hidden rounded-2xl border">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Fecha</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Tareas</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Cumplimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.map((row) => (
                  <tr key={row.date}>
                    <td className="p-4 text-sm font-medium">{row.formattedDate}</td>
                    <td className="p-4 text-sm text-slate-500">{row.completed} / {row.total}</td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-[#001664]">{row.compliance}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
