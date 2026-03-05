import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { USERS } from '../types';
import { motion } from 'motion/react';
import { ChevronRight, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const [selectedUser, setSelectedUser] = useState('');
  const navigate = useNavigate();

  const handleEnter = () => {
    if (selectedUser) {
      navigate(`/dashboard?user=${selectedUser}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tighter text-latam-blue">
              Regla 3-3-3
            </h1>
            <div className="h-1 w-12 bg-latam-red mx-auto rounded-full" />
          </div>
          <p className="text-slate-500 text-sm">
            Planifica tu día con claridad: 3 tareas críticas, 3 administrativas y 3 micro-gestiones.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-latam-blue/5 space-y-6">
          <div className="text-left space-y-2">
            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Selecciona tu usuario
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-latam-blue focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>Elegir nombre...</option>
              {USERS.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleEnter}
            disabled={!selectedUser}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
              selectedUser 
                ? 'bg-latam-blue hover:bg-opacity-90 shadow-lg shadow-latam-blue/20' 
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            Ingresar
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="pt-4">
          <button 
            onClick={() => navigate('/team-kpis')}
            className="text-sm font-bold text-latam-blue hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <TrendingUp size={16} />
            KPIs Grupal (Control Jefatura)
          </button>
        </div>

        <p className="text-xs text-slate-400 uppercase tracking-widest">
          Inspirado en el método de productividad 3-3-3
        </p>
      </motion.div>
    </div>
  );
}
