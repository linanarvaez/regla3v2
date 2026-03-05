import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  USERS, 
  CATEGORIES, 
  loadUserData, 
  TaskCategory 
} from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  format, 
  subDays, 
  isWithinInterval, 
  parseISO, 
  startOfDay, 
  endOfDay,
  eachDayOfInterval
} from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Target, 
  Users as UsersIcon, 
  Calendar,
  AlertTriangle,
  LayoutDashboard,
  AlertCircle,
  History,
  Minus
} from 'lucide-react';
import { motion } from 'motion/react';

export default function TeamKPIsPage() {
  const navigate = useNavigate();

  const teamStats = useMemo(() => {
    const today = new Date();
    const last7Days = {
      start: startOfDay(subDays(today, 6)),
      end: endOfDay(today)
    };

    let totalTasks = 0;
    let completedTasks = 0;
    let activeUsersCount = 0;
    const allDates = new Set<string>();

    const categoryStats = {
      critical: { total: 0, completed: 0 },
      administrative: { total: 0, completed: 0 },
      micro: { total: 0, completed: 0 }
    };

    const userConsistency: any[] = [];
    const alerts: any[] = [];
    const dailyTrendMap: { [date: string]: { total: number, completed: number } } = {};

    // Initialize trend map for last 7 days
    eachDayOfInterval({ start: last7Days.start, end: last7Days.end }).forEach(date => {
      dailyTrendMap[format(date, 'yyyy-MM-dd')] = { total: 0, completed: 0 };
    });

    USERS.forEach(user => {
      const data = loadUserData(user);
      let userTotal = 0;
      let userCompleted = 0;
      let userPerfectDays = 0;
      let userHasData = false;

      Object.entries(data).forEach(([dateStr, plan]) => {
        const date = parseISO(dateStr);
        if (isNaN(date.getTime())) return; // Skip invalid dates

        userHasData = true;
        allDates.add(dateStr);

        let dayTotal = 0;
        let dayCompleted = 0;
        let dayCriticalTotal = 0;
        let dayCriticalCompleted = 0;

        CATEGORIES.forEach(cat => {
          const tasks = plan[cat.id] || [];
          const completed = tasks.filter(t => t.completed).length;
          
          categoryStats[cat.id].total += tasks.length;
          categoryStats[cat.id].completed += completed;
          
          dayTotal += tasks.length;
          dayCompleted += completed;

          if (cat.id === 'critical') {
            dayCriticalTotal += tasks.length;
            dayCriticalCompleted += completed;
          }
        });

        totalTasks += dayTotal;
        completedTasks += dayCompleted;
        userTotal += dayTotal;
        userCompleted += dayCompleted;

        if (dayTotal > 0 && dayTotal === dayCompleted) {
          userPerfectDays++;
        }

        // Trend data
        if (dailyTrendMap[dateStr]) {
          dailyTrendMap[dateStr].total += dayTotal;
          dailyTrendMap[dateStr].completed += dayCompleted;
        }

        // Alerts: Critical tasks not 100% completed
        if (dayCriticalTotal > 0 && dayCriticalCompleted < dayCriticalTotal) {
          alerts.push({
            user,
            date: dateStr,
            pending: dayCriticalTotal - dayCriticalCompleted,
            totalCritical: dayCriticalTotal,
            percentPending: Math.round(((dayCriticalTotal - dayCriticalCompleted) / dayCriticalTotal) * 100)
          });
        }
      });

      if (userHasData) {
        activeUsersCount++;
        userConsistency.push({
          user,
          compliance: userTotal > 0 ? Math.round((userCompleted / userTotal) * 100) : 0,
          perfect_days: userPerfectDays
        });
      }
    });

    const avgCompliance = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const catAvg = CATEGORIES.map(cat => ({
      name: cat.label,
      id: cat.id,
      value: categoryStats[cat.id].total > 0 
        ? Math.round((categoryStats[cat.id].completed / categoryStats[cat.id].total) * 100) 
        : 0,
      color: cat.id === 'critical' ? '#000066' : cat.id === 'administrative' ? '#e61e6e' : '#4d4d4d'
    }));

    const mostDelayed = totalTasks > 0 ? [...catAvg].sort((a, b) => a.value - b.value)[0] : null;

    const trendData = Object.entries(dailyTrendMap).map(([date, stats]) => ({
      date,
      display_date: format(parseISO(date), 'dd MMM', { locale: es }),
      compliance: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Global History (All time aggregation)
    const globalHistoryMap: { [date: string]: { total: number; completed: number; usersCount: number } } = {};
    USERS.forEach(user => {
      const data = loadUserData(user);
      Object.entries(data).forEach(([date, plan]) => {
        if (!globalHistoryMap[date]) {
          globalHistoryMap[date] = { total: 0, completed: 0, usersCount: 0 };
        }
        let dayTotal = 0;
        let dayCompleted = 0;
        CATEGORIES.forEach(cat => {
          const tasks = plan[cat.id] || [];
          dayTotal += tasks.length;
          dayCompleted += tasks.filter(t => t.completed).length;
        });
        if (dayTotal > 0) {
          globalHistoryMap[date].total += dayTotal;
          globalHistoryMap[date].completed += dayCompleted;
          globalHistoryMap[date].usersCount += 1;
        }
      });
    });

    const globalHistory = Object.entries(globalHistoryMap)
      .map(([date, stats]) => ({
        date,
        formattedDate: format(parseISO(date), 'dd MMM', { locale: es }),
        compliance: Math.round((stats.completed / stats.total) * 100),
        users: stats.usersCount,
        totalTasks: stats.total,
        completedTasks: stats.completed
      }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort ascending for variation calculation

    // Calculate variations
    const historyWithVariation = globalHistory.map((row, index) => {
      const prevRow = index > 0 ? globalHistory[index - 1] : null;
      const variation = prevRow ? row.compliance - prevRow.compliance : 0;
      return { ...row, variation };
    }).reverse(); // Reverse back to newest first

    // Calculate weekly average (last 7 days of data)
    const last7DaysHistory = historyWithVariation.slice(0, 7);
    const weeklyAvg = last7DaysHistory.length > 0
      ? Math.round(last7DaysHistory.reduce((acc, curr) => acc + curr.compliance, 0) / last7DaysHistory.length)
      : 0;

    return {
      avgCompliance,
      weeklyAvg,
      activeUsersCount,
      totalDays: allDates.size,
      mostDelayed,
      catAvg,
      trendData,
      userConsistency: userConsistency.sort((a, b) => b.compliance - a.compliance),
      alerts: alerts.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
      globalHistory: historyWithVariation,
      hasData: totalTasks > 0
    };
  }, []);

  const seedDemoData = () => {
    const today = new Date();
    USERS.forEach((user, userIdx) => {
      const userData: any = {};
      // Create data for last 5 days
      for (let i = 0; i < 5; i++) {
        const date = subDays(today, i);
        const dateKey = format(date, 'yyyy-MM-dd');
        
        // Random compliance
        const compliance = 0.5 + (Math.random() * 0.5); // 50% to 100%
        
        userData[dateKey] = {
          critical: Array(3).fill(0).map((_, idx) => ({
            id: `seed-${dateKey}-crit-${idx}`,
            text: `Tarea Crítica ${idx + 1}`,
            completed: Math.random() < compliance
          })),
          administrative: Array(3).fill(0).map((_, idx) => ({
            id: `seed-${dateKey}-adm-${idx}`,
            text: `Tarea Administrativa ${idx + 1}`,
            completed: Math.random() < compliance
          })),
          micro: Array(3).fill(0).map((_, idx) => ({
            id: `seed-${dateKey}-mic-${idx}`,
            text: `Micro-gestión ${idx + 1}`,
            completed: Math.random() < compliance
          }))
        };
      }
      localStorage.setItem(`regla-333-data-${user}`, JSON.stringify(userData));
    });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <h1 className="font-bold text-xl text-slate-900">KPIs Grupal</h1>
              </div>
            </div>
          <div className="flex items-center gap-3">
            {!teamStats.hasData && (
              <button 
                onClick={seedDemoData}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all"
              >
                Generar Datos Demo
              </button>
            )}
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-[#000066] text-white rounded-xl text-sm font-bold"
            >
              <LayoutDashboard size={16} />
              Inicio
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {!teamStats.hasData ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Target size={40} />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Sin datos registrados</h2>
              <p className="text-slate-500">
                Aún no hay información de cumplimiento para mostrar. Los usuarios deben registrar sus tareas en sus respectivos dashboards.
              </p>
            </div>
            <button 
              onClick={seedDemoData}
              className="px-8 py-3 bg-[#000066] text-white rounded-xl font-bold hover:bg-opacity-90 transition-all"
            >
              Poblar con datos de prueba
            </button>
          </div>
        ) : (
          <>
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Disciplina de Ejecución" 
                value={`${teamStats.avgCompliance}%`} 
                subtitle="Nivel de ejecución del equipo"
                icon={<Target size={20} />}
              />
              <MetricCard 
                title="Promedio Semanal" 
                value={`${teamStats.weeklyAvg}%`} 
                subtitle="Últimos 7 días registrados"
                icon={<TrendingUp size={20} />}
              />
              <MetricCard 
                title="Usuarios Activos" 
                value={teamStats.activeUsersCount} 
                subtitle="Colaboradores registrados"
                icon={<UsersIcon size={20} />}
              />
              <MetricCard 
                title="Categoría con Mayor Atraso" 
                value={teamStats.mostDelayed?.name || 'N/A'} 
                subtitle="Menor nivel de cumplimiento"
                icon={<AlertTriangle size={20} />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trend Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800">Tendencia de Disciplina de Ejecución</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={teamStats.trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="display_date" 
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
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="compliance" 
                        stroke="#000066" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#000066', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800">Promedio por Categoría (Nivel Equipo)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={teamStats.catAvg} 
                      layout="vertical"
                      margin={{ left: 20, right: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                        {teamStats.catAvg.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {/* Consistency Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-50">
                    <h3 className="font-bold text-slate-800">Indicador de Consistencia de Ejecución</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usuario</th>
                          <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Disciplina %</th>
                          <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Días Perfectos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {teamStats.userConsistency.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 text-sm font-medium text-slate-700">{row.user}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                                  <div 
                                    className="h-full bg-[#000066]" 
                                    style={{ width: `${row.compliance}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold text-[#000066]">{row.compliance}%</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#000066]">
                                {row.perfect_days} días
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div>
                {/* Strategic Alerts */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-[#E60019]">
                    <AlertCircle size={20} />
                    <h3 className="font-bold">Alertas de Foco Estratégico</h3>
                  </div>
                  <p className="text-sm text-slate-500">Prioridades críticas no completadas.</p>
                  
                  <div className="space-y-2">
                    {teamStats.alerts.map((alert, i) => (
                      <div key={i} className="p-3 bg-red-50 rounded-xl border border-red-100 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{alert.user}</span>
                            <span className="text-xs text-slate-500">{alert.date}</span>
                          </div>
                          <div className="text-xs font-bold text-[#E60019] bg-white px-2 py-1 rounded-lg border border-red-200">
                            {alert.pending} / {alert.totalCritical} tareas
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-red-600 uppercase">
                            <span>Incumplimiento Crítico</span>
                            <span>{alert.percentPending}%</span>
                          </div>
                          <div className="h-1.5 bg-red-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-600" 
                              style={{ width: `${alert.percentPending}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {teamStats.alerts.length === 0 && (
                      <div className="text-center py-4 text-slate-400 text-sm italic">
                        No hay alertas pendientes
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Global History Section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center gap-2">
                <History className="text-latam-blue" size={20} />
                <h3 className="font-bold text-slate-800">Histórico Global de Ejecución</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usuarios Activos</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tareas (Comp/Total)</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Disciplina Ejecución</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Variación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {teamStats.globalHistory.map((row) => (
                      <tr key={row.date} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-sm font-medium text-slate-700">{row.formattedDate}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <UsersIcon size={14} className="text-slate-400" />
                            {row.users}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-500">
                          {row.completedTasks} / {row.totalTasks}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            row.compliance >= 80 ? 'bg-blue-100 text-[#000066]' : 
                            row.compliance >= 50 ? 'bg-amber-100 text-amber-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {row.compliance}%
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className={`flex items-center justify-end gap-1 text-xs font-bold ${
                            row.variation > 0 ? 'text-[#000066]' : 
                            row.variation < 0 ? 'text-[#e61e6e]' : 
                            'text-slate-400'
                          }`}>
                            {row.variation > 0 ? <TrendingUp size={12} /> : 
                             row.variation < 0 ? <TrendingDown size={12} /> : 
                             <Minus size={12} />}
                            {row.variation !== 0 ? `${Math.abs(row.variation)}%` : '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {teamStats.globalHistory.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                          No hay datos históricos registrados aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</div>
        <div className="p-2 bg-slate-50 rounded-lg text-[#000066]">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-[#000066]">{value}</div>
      {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
    </div>
  );
}
