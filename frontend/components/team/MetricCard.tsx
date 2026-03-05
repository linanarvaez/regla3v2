import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
}

export default function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</div>
        <div className="p-2 bg-slate-50 rounded-lg text-[#001664]">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-[#001664]">{value}</div>
      {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
    </div>
  );
}
