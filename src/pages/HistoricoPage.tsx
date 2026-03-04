import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { USERS, loadUserData, CATEGORIES } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, History, Users, BarChart2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function HistoricoPage() {
  const historicoData = useMemo(() => {
    const dailyAggregation: { [date: string]: { total: number; completed: number; usersCount: number } } = {};

    USERS.forEach(user => {
      const data = loadUserData(user);
      Object.entries(data).forEach(([date, plan]) => {
        if (!dailyAggregation[date]) {
          dailyAggregation[date] = { total: 0, completed: 0, usersCount: 0 };
        }
        
        let dayTotal = 0;
        let dayCompleted = 0;
        
        CATEGORIES.forEach(cat => {
          const tasks = plan[cat.id] || [];
          dayTotal += tasks.length;
          dayCompleted += tasks.filter(t => t.completed).length;
        });

        if (dayTotal > 0) {
          dailyAggregation[date].total += dayTotal;
          dailyAggregation[date].completed += dayCompleted;
          dailyAggregation[date].usersCount += 1;
        }
      });
    });

    return Object.entries(dailyAggregation)
      .map(([date, stats]) => ({
        date,
        formattedDate: format(parseISO(date), 'dd MMM', { locale: es }),
        compliance: Math.round((stats.completed / stats.total) * 100),
        users: stats.usersCount,
        totalTasks: stats.total,
        completedTasks: stats.completed
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-bold text-xl text-slate-900">Histórico Global</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-latam-blue/10 rounded-2xl text-latam-blue">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Cumplimiento Ponderado</h2>
              <p className="text-slate-500 text-sm">Rendimiento consolidado de todos los usuarios por día.</p>
            </div>
          </div>

          {historicoData.length > 0 ? (
            <>
              {/* Chart */}
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicoData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="formattedDate" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#94a3b8' }} 
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      unit="%"
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Line 
                      name="Cumplimiento %"
                      type="monotone" 
                      dataKey="compliance" 
                      stroke="#001664" 
                      strokeWidth={4}
                      dot={{ r: 6, fill: '#001664', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usuarios Activos</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tareas (Comp/Total)</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Cumplimiento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {historicoData.map((row) => (
                      <tr key={row.date} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-sm font-medium text-slate-700">{row.formattedDate}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Users size={14} className="text-slate-400" />
                            {row.users}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-500">
                          {row.completedTasks} / {row.totalTasks}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            row.compliance >= 80 ? 'bg-green-100 text-green-700' : 
                            row.compliance >= 50 ? 'bg-amber-100 text-amber-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {row.compliance}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300">
                <BarChart2 size={48} />
              </div>
              <div className="space-y-1">
                <p className="text-slate-900 font-bold">No hay datos históricos</p>
                <p className="text-slate-500 text-sm">Comienza a completar tareas para ver las estadísticas globales.</p>
              </div>
              <Link 
                to="/"
                className="inline-block px-6 py-2 bg-latam-blue text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all"
              >
                Ir al Inicio
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
