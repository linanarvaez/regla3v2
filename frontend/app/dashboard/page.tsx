"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '../../lib/apiClient';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, CheckCircle2, Circle, Calendar as CalendarIcon, 
  BarChart3, LogOut, ChevronLeft, ChevronRight, History 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'critical', label: 'Críticas', color: 'bg-[#001664]', desc: '3 tareas de alto impacto.' },
  { id: 'administrative', label: 'Administrativas', color: 'bg-[#E60019]', desc: '3 tareas operativas.' },
  { id: 'micro', label: 'Micro-gestiones', color: 'bg-[#28a745]', desc: '3 tareas rápidas.' }
];

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = searchParams.get('user') || '';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTexts, setNewTexts] = useState<any>({});

  const fetchTasks = async () => {
    try {
      const data = await apiClient.get(`/api/tasks/${user}/${format(currentDate, 'yyyy-MM-dd')}`);
      setTasks(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!user) router.push('/');
    else fetchTasks();
  }, [user, currentDate]);

  const addTask = async (category: string) => {
    const text = newTexts[category]?.trim();
    if (!text) return;
    try {
      await apiClient.post('/api/tasks/', {
        id: crypto.randomUUID(),
        user_name: user,
        date: format(currentDate, 'yyyy-MM-dd'),
        category,
        text,
        completed: false
      });
      setNewTexts({ ...newTexts, [category]: '' });
      fetchTasks();
    } catch (e) { alert("Límite de 3 tareas alcanzado"); }
  };

  const toggleTask = async (task: any) => {
    await apiClient.put(`/api/tasks/${task.id}`, { completed: !task.completed });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await apiClient.delete(`/api/tasks/${id}`);
    fetchTasks();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="font-bold text-[#001664]">3-3-3 v2 | {user}</h1>
        <div className="flex gap-4">
          <button onClick={() => router.push('/historico')}><History size={20}/></button>
          <button onClick={() => router.push(`/kpis?user=${user}`)}><BarChart3 size={20}/></button>
          <button onClick={() => router.push('/')}><LogOut size={20}/></button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold capitalize">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
          </h2>
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border">
            <button onClick={() => setCurrentDate(subDays(currentDate, 1))}><ChevronLeft/></button>
            <input type="date" value={format(currentDate, 'yyyy-MM-dd')} onChange={(e) => setCurrentDate(new Date(e.target.value))} className="text-sm"/>
            <button onClick={() => setCurrentDate(addDays(currentDate, 1))}><ChevronRight/></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map(cat => {
            const catTasks = tasks.filter(t => t.category === cat.id);
            return (
              <div key={cat.id} className="bg-white rounded-2xl border overflow-hidden shadow-sm">
                <div className={`h-1.5 ${cat.color}`} />
                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <h3 className="font-bold">{cat.label}</h3>
                    <span className="text-xs font-bold text-slate-400">{catTasks.length}/3</span>
                  </div>
                  <div className="space-y-2">
                    {catTasks.map((t: any) => (
                      <div key={t.id} className="flex items-center gap-2 p-2 border rounded-lg">
                        <button onClick={() => toggleTask(t)}>
                          {t.completed ? <CheckCircle2 className="text-green-500"/> : <Circle className="text-slate-300"/>}
                        </button>
                        <span className={`flex-1 text-sm ${t.completed ? 'line-through text-slate-400' : ''}`}>{t.text}</span>
                        <button onClick={() => deleteTask(t.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                  {catTasks.length < 3 && (
                    <div className="flex gap-2">
                      <input 
                        className="flex-1 text-sm border-b outline-none" 
                        placeholder="Nueva..."
                        value={newTexts[cat.id] || ''}
                        onChange={(e) => setNewTexts({...newTexts, [cat.id]: e.target.value})}
                        onKeyDown={(e) => e.key === 'Enter' && addTask(cat.id)}
                      />
                      <button onClick={() => addTask(cat.id)}><Plus size={18}/></button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
