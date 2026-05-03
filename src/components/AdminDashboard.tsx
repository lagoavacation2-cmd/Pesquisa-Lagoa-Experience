import { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, Smile, Meh, Frown, 
  BarChart3, Calendar, Search, Download, 
  RefreshCw, Wifi, WifiOff, LogOut, Filter
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { supabase } from '@/src/lib/supabase';
import { logout } from '@/src/lib/auth';
import { NpsResponse } from '@/src/types';
import StatCard from './StatCard';
import { cn } from '@/src/lib/utils';

export default function AdminDashboard() {
  const [data, setData] = useState<NpsResponse[]>([]);
  const [filteredData, setFilteredData] = useState<NpsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    hotel: '',
    npsClass: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: responses, error } = await supabase
      .from('nps_lagoa_experience')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && responses) {
      setData(responses);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Set up Realtime
    const channel = supabase
      .channel('nps_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'nps_lagoa_experience' 
      }, (payload) => {
        const newResponse = payload.new as NpsResponse;
        setData(prev => [newResponse, ...prev]);
        // Simple Toast logic would go here if needed
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected');
        if (status === 'CHANNEL_ERROR') setRealtimeStatus('error');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let result = [...data];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(r => r.nome.toLowerCase().includes(q) || r.telefone.includes(q));
    }

    if (filters.hotel) {
      result = result.filter(r => r.hotel === filters.hotel);
    }

    if (filters.npsClass) {
      result = result.filter(r => r.classificacao_nps === filters.npsClass);
    }

    if (filters.startDate && filters.endDate) {
      const start = startOfDay(new Date(filters.startDate));
      const end = endOfDay(new Date(filters.endDate));
      result = result.filter(r => {
        const date = parseISO(r.created_at!);
        return isWithinInterval(date, { start, end });
      });
    }

    setFilteredData(result);
  }, [data, filters]);

  // Metrics Calculations
  const total = filteredData.length;
  const promoters = filteredData.filter(r => r.classificacao_nps === 'Promotor').length;
  const neutrals = filteredData.filter(r => r.classificacao_nps === 'Neutro').length;
  const detractors = filteredData.filter(r => r.classificacao_nps === 'Detrator').length;
  const npsScore = total > 0 ? ((promoters - detractors) / total) * 100 : 0;
  
  const getAverage = (field: keyof NpsResponse): string => {
    if (total === 0) return "0.0";
    const sum = filteredData.reduce((acc, curr) => acc + (Number(curr[field]) || 0), 0);
    return (sum / total).toFixed(1);
  };

  // Charts Data
  const npsDistribution = Array.from({ length: 11 }, (_, i) => ({
    note: i,
    count: filteredData.filter(r => r.nota_nps === i).length
  }));

  const categoryAverages = [
    { name: 'Hospedagem', score: parseFloat(getAverage('satisfacao_hospedagem')) },
    { name: 'Atend. Hotel', score: parseFloat(getAverage('atendimento_hotel')) },
    { name: 'Atend. Parque', score: parseFloat(getAverage('atendimento_parque')) },
    { name: 'Estrutura', score: parseFloat(getAverage('lazer_structure')) },
    { name: 'Apresentação', score: parseFloat(getAverage('apresentacao_produto')) },
    { name: 'Clareza', score: parseFloat(getAverage('clareza_consultor')) },
    { name: 'Expectativa', score: parseFloat(getAverage('expectativa_entregue')) },
  ];

  const classData = [
    { name: 'Promotores', value: promoters, color: '#10b981' },
    { name: 'Neutros', value: neutrals, color: '#f59e0b' },
    { name: 'Detratores', value: detractors, color: '#ef4444' }
  ];

  const exportCSV = () => {
    const headers = "Data,Nome,Telefone,Hotel,Nota NPS,Classificação,Comentário\n";
    const rows = filteredData.map(r => 
      `${r.created_at},${r.nome},${r.telefone},${r.hotel},${r.nota_nps},${r.classificacao_nps},"${r.comentario_final?.replace(/"/g, '""') || ''}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `nps_lagoa_export_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Indicadores de Satisfação</h1>
          <div className="flex items-center gap-2 mt-1">
            {realtimeStatus === 'connected' ? (
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Wifi size={12} /> Tempo Real Ativo
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">
                <RefreshCw size={12} className="animate-spin" /> Conectando...
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchData} 
            className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
            title="Atualizar manual"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-3 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-100 transition-all font-bold text-sm border border-sky-100 shadow-sm"
          >
            <Download size={18} /> Exportar CSV
          </button>
          <button 
            onClick={() => { logout(); window.location.reload(); }}
            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Respostas" value={total} icon={<Users size={24} />} variant="blue" />
        <StatCard title="Score NPS" value={npsScore.toFixed(0)} icon={<TrendingUp size={24} />} variant={npsScore >= 75 ? 'emerald' : npsScore >= 50 ? 'amber' : 'red'} trend="Últimos 30 dias" />
        <StatCard title="Satisfação Geral" value={`${(parseFloat(getAverage('satisfacao_hospedagem')) * 20).toFixed(0)}%`} icon={<Smile size={24} />} variant="emerald" />
        <StatCard title="Média Hotel" value={getAverage('atendimento_hotel')} icon={<BarChart3 size={24} />} variant="blue" />
      </div>

      {/* Detailed NPS Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-500 p-6 rounded-3xl text-white shadow-lg shadow-emerald-100">
          <div className="flex justify-between items-center mb-2">
            <Smile size={28} className="opacity-80" />
            <span className="text-3xl font-black">{total > 0 ? ((promoters/total)*100).toFixed(0) : 0}%</span>
          </div>
          <h4 className="text-sm font-bold uppercase tracking-widest opacity-90">Promotores</h4>
          <p className="text-2xl font-bold">{promoters}</p>
        </div>
        <div className="bg-amber-400 p-6 rounded-3xl text-white shadow-lg shadow-amber-100">
          <div className="flex justify-between items-center mb-2">
            <Meh size={28} className="opacity-80" />
            <span className="text-3xl font-black">{total > 0 ? ((neutrals/total)*100).toFixed(0) : 0}%</span>
          </div>
          <h4 className="text-sm font-bold uppercase tracking-widest opacity-90">Neutros</h4>
          <p className="text-2xl font-bold">{neutrals}</p>
        </div>
        <div className="bg-red-500 p-6 rounded-3xl text-white shadow-lg shadow-red-100">
          <div className="flex justify-between items-center mb-2">
            <Frown size={28} className="opacity-80" />
            <span className="text-3xl font-black">{total > 0 ? ((detractors/total)*100).toFixed(0) : 0}%</span>
          </div>
          <h4 className="text-sm font-bold uppercase tracking-widest opacity-90">Detratores</h4>
          <p className="text-2xl font-bold">{detractors}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome/tel" 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-sky-500 transition-all outline-none"
            value={filters.search}
            onChange={e => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <select 
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer"
          value={filters.hotel}
          onChange={e => setFilters({...filters, hotel: e.target.value})}
        >
          <option value="">Todos os Hotéis</option>
          <option value="Lagoa Jardins">Lagoa Jardins</option>
          <option value="Lagoa Eco Towers">Lagoa Eco Towers</option>
          <option value="Lagoa Quente Hotel">Lagoa Quente Hotel</option>
          <option value="Outro">Outro</option>
        </select>
        <select 
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer"
          value={filters.npsClass}
          onChange={e => setFilters({...filters, npsClass: e.target.value})}
        >
          <option value="">Todas Categorias</option>
          <option value="Promotor">Somente Promotores</option>
          <option value="Neutro">Somente Neutros</option>
          <option value="Detrator">Somente Detratores</option>
        </select>
        <input 
          type="date" 
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer"
          value={filters.startDate}
          onChange={e => setFilters({...filters, startDate: e.target.value})}
        />
        <input 
          type="date" 
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer"
          value={filters.endDate}
          onChange={e => setFilters({...filters, endDate: e.target.value})}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NPS Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-sky-600" /> Distribuição das Notas NPS
          </h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={npsDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="note" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="count" fill="#0077b6" radius={[6, 6, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Category Averages */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" /> Média por Categoria
          </h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryAverages} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} width={100} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="score" fill="#90e0ef" radius={[0, 6, 6, 0]}>
                    {categoryAverages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 4 ? '#10b981' : entry.score >= 3 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Responses Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Respostas Recentes</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredData.length} avaliações</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Data</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nome</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Hotel</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">NPS</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Comentário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {r.created_at ? format(parseISO(r.created_at), 'dd/MM/yy HH:mm') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{r.nome}</span>
                      <span className="text-xs text-slate-500">{r.telefone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{r.hotel}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "inline-block w-8 h-8 leading-8 rounded-lg font-bold text-sm",
                      r.classificacao_nps === 'Promotor' ? "bg-emerald-100 text-emerald-600" :
                      r.classificacao_nps === 'Neutro' ? "bg-amber-100 text-amber-600" :
                      "bg-red-100 text-red-600"
                    )}>
                      {r.nota_nps}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500 line-clamp-2 italic max-w-xs">
                      {r.comentario_final || '-'}
                    </p>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Nenhuma resposta encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
