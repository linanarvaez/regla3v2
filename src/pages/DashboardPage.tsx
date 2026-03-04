import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  formatDateKey, 
  loadUserData, 
  saveUserData, 
  getEmptyDayPlan, 
  CATEGORIES, 
  Task, 
  TaskCategory,
  USERS
} from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar as CalendarIcon, 
  BarChart3, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  History
} from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = searchParams.get('user') || '';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plan, setPlan] = useState(getEmptyDayPlan());
  const [newTaskText, setNewTaskText] = useState<{ [key in TaskCategory]?: string }>({});

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    const data = loadUserData(user);
    const dateKey = formatDateKey(currentDate);
    setPlan(data[dateKey] || getEmptyDayPlan());
  }, [user, currentDate, navigate]);

  const updatePlan = (newPlan: typeof plan) => {
    setPlan(newPlan);
    const data = loadUserData(user);
    data[formatDateKey(currentDate)] = newPlan;
    saveUserData(user, data);
  };

  const addTask = (category: TaskCategory) => {
    const text = newTaskText[category]?.trim();
    if (!text || plan[category].length >= 3) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false
    };

    updatePlan({
      ...plan,
      [category]: [...plan[category], newTask]
    });
    setNewTaskText({ ...newTaskText, [category]: '' });
  };

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveEdit = (category: TaskCategory) => {
    if (!editingTaskId) return;
    const newTasks = plan[category].map(t => 
      t.id === editingTaskId ? { ...t, text: editingText } : t
    );
    updatePlan({ ...plan, [category]: newTasks });
    setEditingTaskId(null);
  };

  const toggleTask = (category: TaskCategory, id: string) => {
    const newTasks = plan[category].map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    updatePlan({ ...plan, [category]: newTasks });
  };

  const deleteTask = (category: TaskCategory, id: string) => {
    const newTasks = plan[category].filter(t => t.id !== id);
    updatePlan({ ...plan, [category]: newTasks });
  };

  const handleUserChange = (newUser: string) => {
    setSearchParams({ user: newUser });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = new Date(e.target.value);
    if (!isNaN(d.getTime())) {
      setCurrentDate(d);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-bottom border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-latam-blue font-bold text-xl">3-3-3</Link>
            <div className="h-4 w-[1px] bg-slate-200" />
            <select 
              value={user} 
              onChange={(e) => handleUserChange(e.target.value)}
              className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer text-slate-600"
            >
              {USERS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              to="/historico"
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              title="Ver Histórico Global"
            >
              <History size={20} />
            </Link>
            <Link 
              to={`/kpis?user=${user}`}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              title="Ver KPIs"
            >
              <BarChart3 size={20} />
            </Link>
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              title="Salir"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Date Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-slate-900 capitalize">
              {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
            </h2>
            <p className="text-slate-500">Organiza tus prioridades para hoy.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setCurrentDate(subDays(currentDate, 1))}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="relative flex items-center gap-2 px-2">
              <CalendarIcon size={16} className="text-slate-400" />
              <input 
                type="date" 
                value={formatDateKey(currentDate)}
                onChange={handleDateChange}
                className="text-sm font-medium border-none focus:ring-0 cursor-pointer bg-transparent"
              />
            </div>
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, 1))}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Task Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const tasks = plan[cat.id];
            const completedCount = tasks.filter(t => t.completed).length;
            const progress = tasks.length > 0 ? (completedCount / 3) * 100 : 0;
            const isFull = tasks.length >= 3;

            return (
              <motion.section 
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
              >
                <div className={`h-1.5 ${cat.color}`} />
                <div className="p-6 space-y-6 flex-1 flex flex-col">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg text-slate-900">{cat.label}</h3>
                      <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {completedCount}/3
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(completedCount / 3) * 100}%` }}
                      className={`h-full ${cat.color} transition-all duration-500`}
                    />
                  </div>

                  {/* Task List */}
                  <div className="space-y-3 flex-1">
                    <AnimatePresence initial={false}>
                      {tasks.map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            task.completed 
                              ? 'bg-slate-50 border-slate-100' 
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <button 
                            onClick={() => toggleTask(cat.id, task.id)}
                            className={`shrink-0 transition-colors ${
                              task.completed ? 'text-latam-green' : 'text-slate-300 hover:text-slate-400'
                            }`}
                          >
                            {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                          </button>
                          
                          {editingTaskId === task.id ? (
                            <input
                              autoFocus
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onBlur={() => saveEdit(cat.id)}
                              onKeyDown={(e) => e.key === 'Enter' && saveEdit(cat.id)}
                              className="flex-1 text-sm bg-transparent outline-none border-b border-latam-blue"
                            />
                          ) : (
                            <span 
                              onClick={() => startEditing(task)}
                              className={`flex-1 text-sm leading-tight transition-all cursor-text ${
                                task.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                              }`}
                            >
                              {task.text}
                            </span>
                          )}

                          <button 
                            onClick={() => deleteTask(cat.id, task.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-latam-red transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {tasks.length === 0 && (
                      <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl text-slate-300 space-y-2">
                        <Plus size={24} />
                        <span className="text-xs font-medium">Sin tareas</span>
                      </div>
                    )}
                  </div>

                  {/* Add Task Input */}
                  {!isFull ? (
                    <div className="relative pt-4 border-t border-slate-50">
                      <input 
                        type="text"
                        placeholder="Nueva tarea..."
                        value={newTaskText[cat.id] || ''}
                        onChange={(e) => setNewTaskText({ ...newTaskText, [cat.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && addTask(cat.id)}
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-200 focus:border-slate-300 outline-none transition-all"
                      />
                      <button 
                        onClick={() => addTask(cat.id)}
                        className="absolute right-2 top-[22px] p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-latam-blue hover:border-latam-blue transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Límite alcanzado (3/3)
                      </span>
                    </div>
                  )}
                </div>
              </motion.section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
