import React from 'react';

interface ConsistencyTableProps {
  data: any[];
}

export default function ConsistencyTable({ data }: ConsistencyTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50">
        <h3 className="font-bold text-slate-800">Indicador de Consistencia de Ejecución</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usuario</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Promedio Cumplimiento %</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Días Perfectos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-sm font-medium text-slate-700">{row.user}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                      <div 
                        className="h-full bg-[#001664]" 
                        style={{ width: `${row.compliance}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[#001664]">{row.compliance}%</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    {row.perfect_days} días
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
