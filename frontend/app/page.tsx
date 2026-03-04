"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

const USERS = ['Ana', 'Claudia', 'Fran', 'Gra', 'Ilonka', 'Josue', 'Lina', 'Paty', 'Pauli', 'Sascha'];

export default function HomePage() {
  const [selectedUser, setSelectedUser] = useState('');
  const router = useRouter();

  const handleEnter = () => {
    if (selectedUser) {
      router.push(`/dashboard?user=${selectedUser}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tighter text-[#001664]">
            Regla 3-3-3
          </h1>
          <p className="text-slate-500 text-lg">
            Planifica tu día con claridad institucional.
          </p>
        </div>

        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none"
          >
            <option value="" disabled>Selecciona tu usuario</option>
            {USERS.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>

          <button
            onClick={handleEnter}
            disabled={!selectedUser}
            className="w-full py-4 bg-[#001664] text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:bg-slate-300"
          >
            Ingresar <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>
    </main>
  );
}
