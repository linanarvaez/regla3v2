import React from 'react';
import { AlertCircle } from 'lucide-react';

interface StrategicAlertsProps {
  data: any[];
}

export default function StrategicAlerts({ data }: StrategicAlertsProps) {
  if (data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-[#E60019]">
        <AlertCircle size={20} />
        <h3 className="font-bold">Alertas de Foco Estratégico</h3>
      </div>
      <p className="text-sm text-slate-500">Se identificaron prioridades críticas no completadas.</p>
      
      <div className="space-y-2">
        {data.map((alert, i) => (
          <div key={i} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">{alert.user}</span>
              <span className="text-xs text-slate-500">{alert.date}</span>
            </div>
            <div className="text-xs font-bold text-[#E60019] bg-white px-2 py-1 rounded-lg border border-red-200">
              {alert.pending} pendientes
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
