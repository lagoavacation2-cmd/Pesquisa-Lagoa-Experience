import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, Smile, Meh, Frown, 
  BarChart3, Calendar, Search, Download, 
  RefreshCw, Wifi, WifiOff, LogOut, Filter, Trash2, AlertCircle, Eye
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { supabase } from '@/src/lib/supabase';
import { logout } from '@/src/lib/auth';
import { NpsResponse } from '@/src/types';
import StatCard from './StatCard';
import SurveyDetailModal from './SurveyDetailModal';
import { cn } from '@/src/lib/utils';

export default function AdminDashboard({ onLogout }: { onLogout?: () => void }) {
  const [data, setData] = useState<NpsResponse[]>([]);
  const [filteredData, setFilteredData] = useState<NpsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  
  // Modal State
  const [selectedSurvey, setSelectedSurvey] = useState<NpsResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    startDate: '', // Survey date
    endDate: '',   // Survey date
    hotel: '',
    npsClass: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: responses, error } = await supabase
        .from('nps_lagoa_experience')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (responses) setData(responses);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up Realtime global channel
    const channel = supabase
      .channel('nps-lagoa-experience-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'nps_lagoa_experience' 
      }, (payload) => {
        console.log('Mudança Realtime recebida:', payload);
        
        if (payload.eventType === 'INSERT') {
          const newResponse = payload.new as NpsResponse;
          setData(prev => [newResponse, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          setData(prev => prev.filter(item => item.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as NpsResponse;
          setData(prev => prev.map(item => item.id === updated.id ? updated : item));
        }
      })
      .subscribe((status) => {
        console.log('Status Realtime:', status);
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected');
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setRealtimeStatus('error');
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

  const handleDelete = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a pesquisa de "${nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('nps_lagoa_experience')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // If the deleted survey was open in the modal, close it
      if (selectedSurvey?.id === id) {
        setIsModalOpen(false);
        setSelectedSurvey(null);
      }
    } catch (err: any) {
      console.error('Erro ao excluir:', err);
      alert('Não foi possível excluir a pesquisa. ' + (err.message || ''));
    } finally {
      setDeletingId(null);
    }
  };

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
  const npsDistribution = Array.from({ length: 6 }, (_, i) => ({
    note: i,
    count: filteredData.filter(r => r.nota_nps === i).length
  }));

  const categoryAverages = [
    { name: 'Hospedagem', score: parseFloat(getAverage('satisfacao_hospedagem')) },
    { name: 'Atend. Hotel', score: parseFloat(getAverage('atendimento_hotel')) },
    { name: 'Atend. Parque', score: parseFloat(getAverage('atendimento_parque')) },
    { name: 'Estrutura', score: parseFloat(getAverage('lazer_estrutura')) },
    { name: 'Apres. Sala Vendas', score: parseFloat(getAverage('apresentacao_produto')) },
    { name: 'Clareza', score: parseFloat(getAverage('clareza_consultor')) },
    { name: 'Expectativa', score: parseFloat(getAverage('expectativa_entregue')) },
  ];

  const exportCSV = () => {
    const headers = "Data Pesquisa,Nome,Telefone,Hotel,Nota NPS,Classificação,Comentário\n";
    const rows = filteredData.map(r => 
      `${r.created_at},${r.nome},${r.telefone},${r.hotel},${r.nota_nps},${r.classificacao_nps},"${r.comentario_final?.replace(/"/g, '""') || ''}"`
    ).join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `nps_lagoa_export_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Detail Modal */}
      <SurveyDetailModal 
        survey={selectedSurvey}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleDelete}
        isDeleting={deletingId === selectedSurvey?.id}
      />

      {/* Header Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Indicadores em Tempo Real</h1>
          <div className="flex items-center gap-2 mt-1">
            {realtimeStatus === 'connected' ? (
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Wifi size={12} /> Conectado
              </span>
            ) : realtimeStatus === 'connecting' ? (
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">
                <RefreshCw size={12} className="animate-spin" /> Conectando...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                <WifiOff size={12} /> Erro Conexão
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchData} 
            className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
            title="Sincronizar agora"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-3 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-100 transition-all font-bold text-sm border border-sky-100 shadow-sm"
          >
            <Download size={18} /> Exportar
          </button>
          <button 
            onClick={() => { 
              logout(); 
              if (onLogout) {
                onLogout();
              } else {
                window.location.href = '/admin';
              }
            }}
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
        <StatCard title="Score NPS" value={npsScore.toFixed(0)} icon={<TrendingUp size={24} />} variant={npsScore >= 75 ? 'emerald' : npsScore >= 50 ? 'amber' : 'red'} />
        <StatCard title="Média Hospedagem" value={getAverage('satisfacao_hospedagem')} icon={<Smile size={24} />} variant="emerald" />
        <StatCard title="Atendimento Hotel" value={getAverage('atendimento_hotel')} icon={<BarChart3 size={24} />} variant="blue" />
      </div>

      {/* DETAILED NPS BLOCKS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-500 p-6 rounded-3xl text-white shadow-lg shadow-emerald-100 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-10 -translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform">
             <Smile size={120} />
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-3xl font-black">{total > 0 ? ((promoters/total)*100).toFixed(0) : 0}%</span>
            <Smile size={24} className="opacity-80" />
          </div>
          <h4 className="text-sm font-bold uppercase tracking-widest opacity-90">Promotores</h4>
          <p className="text-2xl font-bold">{promoters}</p>
        </div>
        <div className="bg-amber-400 p-6 rounded-3xl text-white shadow-lg shadow-amber-100 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-10 -translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform">
             <Meh size={120} />
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-3xl font-black">{total > 0 ? ((neutrals/total)*100).toFixed(0) : 0}%</span>
            <Meh size={24} className="opacity-80" />
          </div>
          <h4 className="text-sm font-bold uppercase tracking-widest opacity-90">Neutros</h4>
          <p className="text-2xl font-bold">{neutrals}</p>
        </div>
        <div className="bg-red-500 p-6 rounded-3xl text-white shadow-lg shadow-red-100 relative overflow-hidden group">
           <div className="absolute right-0 bottom-0 opacity-10 -translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform">
             <Frown size={120} />
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-3xl font-black">{total > 0 ? ((detractors/total)*100).toFixed(0) : 0}%</span>
            <Frown size={24} className="opacity-80" />
          </div>
          <h4 className="text-sm font-bold uppercase tracking-widest opacity-90">Detratores</h4>
          <p className="text-2xl font-bold">{detractors}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
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
        </select>
        <select 
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer"
          value={filters.npsClass}
          onChange={e => setFilters({...filters, npsClass: e.target.value})}
        >
          <option value="">Todas Categorias</option>
          <option value="Promotor">Promotores</option>
          <option value="Neutro">Neutros</option>
          <option value="Detrator">Detratores</option>
        </select>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input 
            type="date" 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer"
            value={filters.startDate}
            onChange={e => setFilters({...filters, startDate: e.target.value})}
            title="Data da Pesquisa (Início)"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input 
            type="date" 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer"
            value={filters.endDate}
            onChange={e => setFilters({...filters, endDate: e.target.value})}
            title="Data da Pesquisa (Fim)"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-sky-600" /> Distribuição NPS (0-5)
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

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" /> Médias por Categoria
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
                      <Cell key={`cell-${index}`} fill={entry.score >= 4.5 ? '#10b981' : entry.score >= 3 ? '#f59e0b' : '#ef4444'} />
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
          <h3 className="text-lg font-bold text-slate-800">Histórico de Pesquisas</h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
            {filteredData.length} registros
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Pesquisa</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Hóspede / Hotel</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">NPS</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Obs</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((r) => (
                <tr 
                  key={r.id} 
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  onClick={() => {
                    setSelectedSurvey(r);
                    setIsModalOpen(true);
                  }}
                >
                  <td className="px-6 py-4 text-[11px] text-slate-500 whitespace-nowrap">
                    {r.created_at ? format(parseISO(r.created_at), 'dd/MM/yy HH:mm') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{r.nome}</span>
                      <span className="text-[10px] text-sky-600 font-bold uppercase tracking-tighter">{r.hotel}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={cn(
                        "inline-block w-8 h-8 leading-8 rounded-lg font-bold text-sm",
                        r.classificacao_nps === 'Promotor' ? "bg-emerald-100 text-emerald-600" :
                        r.classificacao_nps === 'Neutro' ? "bg-amber-100 text-amber-600" :
                        "bg-red-100 text-red-600"
                      )}>
                        {r.nota_nps}
                      </span>
                      <span className="text-[9px] font-bold uppercase text-slate-400">{r.classificacao_nps}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      {r.comentario_final ? (
                        <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 max-w-xs">
                          <AlertCircle size={14} className="text-sky-500 mt-0.5 flex-shrink-0" />
                          <p className="text-[11px] text-slate-600 italic line-clamp-2">
                            "{r.comentario_final}"
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 italic">Sem comentário</span>
                      )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedSurvey(r);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-sky-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-all"
                        title="Ver detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => r.id && handleDelete(r.id, r.nome)}
                        disabled={deletingId === r.id}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
                        title="Excluir"
                      >
                        {deletingId === r.id ? (
                          <RefreshCw size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center gap-3">
                      <Search size={40} className="opacity-20" />
                      Nenhum resultado encontrado com os filtros aplicados.
                    </div>
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
