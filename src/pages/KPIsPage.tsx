import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  loadUserData, 
  USERS, 
  CATEGORIES, 
  TaskCategory, 
  DayPlan 
} from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  format, 
  subDays, 
  isWithinInterval, 
  parseISO, 
  startOfDay, 
  endOfDay 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ArrowLeft, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Filter,
  History
} from 'lucide-react';
import { motion } from 'motion/react';

export default function KPIsPage() {
  const [searchParams] = useSearchParams();
  const initialUser = searchParams.get('user') || USERS[0];
  
  const [selectedUser, setSelectedUser] = useState(initialUser);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const stats = useMemo(() => {
    const data = loadUserData(selectedUser);
    const startDate = startOfDay(parseISO(dateRange.start));
    const endDate = endOfDay(parseISO(dateRange.end));

    let totalTasks = 0;
    let completedTasks = 0;
    let daysWith100Percent = 0;
    
    const categoryStats = {
      critical: { total: 0, completed: 0 },
      administrative: { total: 0, completed: 0 },
      micro: { total: 0, completed: 0 }
    };

    const dailyData: any[] = [];

    // Iterate through all dates in storage
    Object.entries(data).forEach(([dateStr, plan]) => {
      const date = parseISO(dateStr);
      if (isWithinInterval(date, { start: startDate, end: endDate })) {
        let dayTotal = 0;
        let dayCompleted = 0;

        CATEGORIES.forEach(cat => {
          const tasks = plan[cat.id] || [];
          categoryStats[cat.id].total += tasks.length;
          categoryStats[cat.id].completed += tasks.filter(t => t.completed).length;
          
          dayTotal += tasks.length;
          dayCompleted += tasks.filter(t => t.completed).length;
        });

        totalTasks += dayTotal;
        completedTasks += dayCompleted;

        if (dayTotal > 0 && dayTotal === dayCompleted) {
          daysWith100Percent++;
        }

        dailyData.push({
          date: format(date, 'dd MMM', { locale: es }),
          fullDate: dateStr,
          completion: dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0
        });
      }
    });

    // Sort daily data by date
    dailyData.sort((a, b) => a.fullDate.localeCompare(b.fullDate));

    const avgCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const catCompletion = CATEGORIES.map(cat => ({
      name: cat.label,
      id: cat.id,
      value: categoryStats[cat.id].total > 0 
        ? Math.round((categoryStats[cat.id].completed / categoryStats[cat.id].total) * 100) 
        : 0,
      color: cat.id === 'critical' ? '#001664' : cat.id === 'administrative' ? '#E60019' : '#28a745'
    }));

    // Find category with most "atraso" (lowest completion)
    const categoryWithMostDelay = [...catCompletion]
      .filter(c => categoryStats[c.id as TaskCategory].total > 0)
      .sort((a, b) => a.value - b.value)[0];

    return {
      avgCompletion,
      daysWith100Percent,
      catCompletion,
      categoryWithMostDelay,
      dailyData
    };
  }, [selectedUser, dateRange]);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/dashboard?user=${selectedUser}`} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-bold text-xl text-slate-900">Métricas y KPIs</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              to="/historico"
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              title="Ver Histórico Global"
            >
              <History size={20} />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Filters */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Filter size={18} className="text-latam-blue" />
            <h2>Filtros de Análisis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usuario</label>
              <select 
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-latam-blue/20"
              >
                {USERS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Desde</label>
              <input 
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-latam-blue/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hasta</label>
              <input 
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-latam-blue/20"
              />
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard 
            title="Cumplimiento Total" 
            value={`${stats.avgCompletion}%`} 
            icon={<TrendingUp className="text-latam-blue" />}
            description="Promedio de tareas completadas"
          />
          <KPICard 
            title="Días Perfectos" 
            value={stats.daysWith100Percent} 
            icon={<CheckCircle className="text-latam-green" />}
            description="Días con 100% de cumplimiento"
          />
          <KPICard 
            title="Mayor Atraso" 
            value={stats.categoryWithMostDelay?.name || 'N/A'} 
            icon={<AlertCircle className="text-latam-red" />}
            description="Categoría con menor cumplimiento"
            valueClass="text-latam-red"
          />
          <KPICard 
            title="Días Registrados" 
            value={stats.dailyData.length} 
            icon={<Calendar className="text-slate-400" />}
            description="Total de días con planificación"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Completion Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900">Cumplimiento por Categoría</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.catCompletion} layout="vertical" margin={{ left: 40, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {stats.catCompletion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Progress Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900">Progreso Diario (%)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="completion" fill="#001664" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function KPICard({ title, value, icon, description, valueClass = "text-slate-900" }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="p-2 bg-slate-50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <div className={`text-3xl font-bold ${valueClass}`}>{value}</div>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </motion.div>
  );
}
