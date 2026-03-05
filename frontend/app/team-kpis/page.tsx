"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/apiClient';
import { 
  ArrowLeft, Users, Calendar, TrendingUp, Target, 
  AlertTriangle, LayoutDashboard 
} from 'lucide-react';
import MetricCard from '../../components/team/MetricCard';
import TrendChart from '../../components/team/TrendChart';
import CategoryChart from '../../components/team/CategoryChart';
import ConsistencyTable from '../../components/team/ConsistencyTable';
import StrategicAlerts from '../../components/team/StrategicAlerts';

export default function TeamKPIsPage() {
  const router = useRouter();
  const [kpis, setKpis] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [catAvg, setCatAvg] = useState<any>(null);
  const [consistency, setConsistency] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpisData, trendData, catAvgData, consistencyData, alertsData] = await Promise.all([
          apiClient.get('/api/team/kpis'),
          apiClient.get('/api/team/trend'),
          apiClient.get('/api/team/category-average'),
          apiClient.get('/api/team/consistency'),
          apiClient.get('/api/team/alerts')
        ]);

        setKpis(kpisData);
        setTrend(trendData);
        setCatAvg(catAvgData);
        setConsistency(consistencyData);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400 font-medium">Cargando métricas de equipo...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-xl text-slate-900">KPIs Grupal - Control de Jefatura</h1>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 bg-[#001664] text-white rounded-xl text-sm font-bold"
          >
            <LayoutDashboard size={16} />
            Inicio
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="% Cumplimiento Total" 
            value={`${kpis?.compliance}%`} 
            subtitle="Promedio total del equipo"
            icon={<Target size={20} />}
          />
          <MetricCard 
            title="Usuarios Activos" 
            value={kpis?.active_users} 
            subtitle="Colaboradores registrados"
            icon={<Users size={20} />}
          />
          <MetricCard 
            title="Días Registrados" 
            value={kpis?.total_days} 
            subtitle="Historial de ejecución"
            icon={<Calendar size={20} />}
          />
          <MetricCard 
            title="Categoría con Mayor Atraso" 
            value={kpis?.most_delayed_category === 'critical' ? 'Críticas' : kpis?.most_delayed_category === 'administrative' ? 'Administrativas' : 'Micro-gestiones'} 
            subtitle="Menor nivel de cumplimiento"
            icon={<AlertTriangle size={20} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TrendChart data={trend} />
          <CategoryChart data={catAvg} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ConsistencyTable data={consistency} />
          </div>
          <div>
            <StrategicAlerts data={alerts} />
          </div>
        </div>
      </main>
    </div>
  );
}
