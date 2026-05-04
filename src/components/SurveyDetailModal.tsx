import React from 'react';
import { 
  X, Phone, Mail, Calendar, MapPin, 
  MessageSquare, Trash2, AlertCircle, 
  Clock, User, BarChart3, Star,
  ShieldCheck, ShieldAlert, AlertTriangle, RefreshCw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { NpsResponse } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SurveyDetailModalProps {
  survey: NpsResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string, name: string) => Promise<void>;
  isDeleting: boolean;
}

export default function SurveyDetailModal({ survey, isOpen, onClose, onDelete, isDeleting }: SurveyDetailModalProps) {
  if (!survey) return null;

  const ratingsFields = [
    { key: 'satisfacao_hospedagem', label: 'Avaliação da hospedagem' },
    { key: 'atendimento_hotel', label: 'Atendimento equipe hotel' },
    { key: 'atendimento_parque', label: 'Atendimento equipe parque' },
    { key: 'lazer_estrutura', label: 'Lazer, estrutura e conforto' },
    { key: 'apresentacao_produto', label: 'Apresentação produto Lagoa' },
    { key: 'clareza_consultor', label: 'Clareza e respeito consultor' },
    { key: 'expectativa_entregue', label: 'Correspondência expectativa' },
    { key: 'nota_nps', label: 'Recomendação (NPS)' },
  ];

  const calculateAverage = () => {
    const values = [
      survey.satisfacao_hospedagem,
      survey.atendimento_hotel,
      survey.atendimento_parque,
      survey.lazer_estrutura,
      survey.apresentacao_produto,
      survey.clareza_consultor,
      survey.expectativa_entregue,
      survey.nota_nps
    ];
    const sum = values.reduce((a, b) => a + b, 0);
    return (sum / values.length).toFixed(1);
  };

  const avg = parseFloat(calculateAverage());

  const getStatus = () => {
    if (avg >= 4.5) return { label: 'Excelente', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: <ShieldCheck size={16} /> };
    if (avg >= 3) return { label: 'Atenção', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: <AlertTriangle size={16} /> };
    return { label: 'Crítico', color: 'text-red-600 bg-red-50 border-red-100', icon: <ShieldAlert size={16} /> };
  };

  const getAnalysis = () => {
    if (avg >= 4.5) return "Cliente demonstra alta satisfação com a experiência.";
    if (avg >= 3) return "Cliente demonstra satisfação parcial, com pontos que merecem acompanhamento.";
    return "Cliente demonstra insatisfação relevante. Recomenda-se análise e contato de recuperação.";
  };

  const criticalPoints = ratingsFields
    .filter(f => (survey as any)[f.key] <= 2)
    .map(f => `Baixa avaliação em: ${f.label.toLowerCase()}`);

  const status = getStatus();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[32px] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 leading-tight">{survey.nome}</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detalhes da Avaliação</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
              
              {/* Row 1: Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Média Geral</span>
                  <span className="text-4xl font-black text-sky-600">{avg}</span>
                  <span className="text-[10px] font-bold text-slate-300">Escala 0-5</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Recomendação</span>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2",
                    survey.classificacao_nps === 'Promotor' ? "bg-emerald-100 text-emerald-600" :
                    survey.classificacao_nps === 'Neutro' ? "bg-amber-100 text-amber-600" :
                    "bg-red-100 text-red-600"
                  )}>
                    {survey.classificacao_nps}
                  </div>
                  <span className="text-2xl font-black text-slate-800">{survey.nota_nps}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status Visual</span>
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border",
                    status.color
                  )}>
                    {status.icon}
                    {status.label}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Respondido em</span>
                  <div className="flex flex-col items-center text-slate-600">
                    <span className="text-lg font-bold">{survey.created_at ? format(parseISO(survey.created_at), 'dd/MM/yy') : '-'}</span>
                    <span className="text-xs font-medium">{survey.created_at ? format(parseISO(survey.created_at), 'HH:mm') : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Customer Data & Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Card */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <User size={16} className="text-sky-500" /> Dados do Cliente
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <Phone size={18} className="text-slate-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Telefone / WhatsApp</p>
                        <p className="text-sm font-bold text-slate-700">{survey.telefone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <Mail size={18} className="text-slate-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">E-mail</p>
                        <p className="text-sm font-bold text-slate-700">{survey.email || 'Não informado'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <MapPin size={18} className="text-slate-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Hotel</p>
                        <p className="text-sm font-bold text-slate-700">{survey.hotel}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Card */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <BarChart3 size={16} className="text-sky-500" /> Análise da Avaliação
                  </h3>
                  <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl">
                    <p className="text-sm font-medium text-sky-800 leading-relaxed italic">
                      "{getAnalysis()}"
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pontos de Atenção</p>
                    {criticalPoints.length > 0 ? (
                      <div className="space-y-1.5">
                        {criticalPoints.map((point, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                            <AlertCircle size={14} />
                            {point}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <ShieldCheck size={14} />
                        Nenhum ponto crítico identificado.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: Question Details */}
              <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-5">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Star size={16} className="text-sky-500" /> Detalhamento por Pergunta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {ratingsFields.map((field) => (
                    <div key={field.key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <span className="text-xs font-semibold text-slate-600">{field.label}</span>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border-2",
                        (survey as any)[field.key] <= 2 ? "bg-red-50 border-red-200 text-red-500" :
                        (survey as any)[field.key] <= 4 ? "bg-amber-50 border-amber-200 text-amber-500" :
                        "bg-emerald-50 border-emerald-200 text-emerald-500"
                      )}>
                        {(survey as any)[field.key]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: Comment */}
              <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <MessageSquare size={16} className="text-sky-500" /> Comentário Adicional
                </h3>
                {survey.comentario_final ? (
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative">
                    <Clock size={40} className="absolute right-4 bottom-4 text-slate-200 opacity-20" />
                    <p className="text-sm font-medium text-slate-700 leading-relaxed italic relative z-10">
                      "{survey.comentario_final}"
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed text-center">
                    <p className="text-sm font-medium text-slate-400 italic">Cliente não deixou comentário adicional.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button 
                onClick={onClose}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
              >
                Fechar Detalhes
              </button>
              
              <button 
                onClick={() => survey.id && onDelete(survey.id, survey.nome)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-100 transition-all border border-red-100 shadow-sm disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw size={18} className="animate-spin" /> : <Trash2 size={18} />}
                Excluir Avaliação
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
