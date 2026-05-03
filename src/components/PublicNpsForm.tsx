import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Phone, User, Home, Calendar, Mail } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { cn, formatPhone, getDeviceType } from '@/src/lib/utils';
import RatingScale from './RatingScale';
import NpsScale from './NpsScale';
import ThankYouScreen from './ThankYouScreen';
import { NpsResponse } from '@/src/types';

const HOTELS = ["Lagoa Jardins", "Lagoa Eco Towers", "Lagoa Quente Hotel", "Outro"];

export default function PublicNpsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    hotel: '',
    periodo_hospedagem: '',
    satisfacao_hospedagem: 0,
    atendimento_hotel: 0,
    atendimento_parque: 0,
    lazer_structure: 0,
    apresentacao_produto: 0,
    clareza_consultor: 0,
    expectativa_entregue: 0,
    nota_nps: null as number | null,
    comentario_final: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.nome || !formData.telefone || !formData.hotel) {
      setError("Por favor, preencha os campos obrigatórios.");
      return;
    }

    if (formData.nota_nps === null) {
      setError("Por favor, responda a pergunta de recomendação (NPS).");
      return;
    }

    const mandatoryRatings = [
      formData.satisfacao_hospedagem,
      formData.atendimento_hotel,
      formData.atendimento_parque,
      formData.lazer_structure,
      formData.apresentacao_produto,
      formData.clareza_consultor,
      formData.expectativa_entregue
    ];

    if (mandatoryRatings.some(r => r === 0)) {
      setError("Por favor, responda todas as avaliações por estrelas.");
      return;
    }

    setLoading(true);

    try {
      const classification = formData.nota_nps >= 9 ? 'Promotor' : formData.nota_nps >= 7 ? 'Neutro' : 'Detrator';
      
      const payload: NpsResponse = {
        ...formData,
        nota_nps: formData.nota_nps,
        classificacao_nps: classification,
        origem: 'Lagoa Experience',
        user_agent: navigator.userAgent,
        dispositivo: getDeviceType()
      };

      const { error: submitError } = await supabase
        .from('nps_lagoa_experience')
        .insert([payload]);

      if (submitError) throw submitError;

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setError("Erro ao enviar avaliação. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <ThankYouScreen nps={formData.nota_nps || 0} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="mb-8 text-center sm:text-left px-4">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 leading-tight">
          Pesquisa de Satisfação <span className="text-sky-600">Lagoa Experience</span>
        </h1>
        <p className="text-slate-600">
          Sua opinião é muito importante para continuarmos melhorando a sua experiência no Grupo Lagoa Quente.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-4 pb-20">
        {/* Step 1: Identification */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm">1</div>
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Identificação</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Nome Completo *"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
                value={formData.nome}
                onChange={e => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                placeholder="Telefone/WhatsApp *"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
                value={formData.telefone}
                onChange={e => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="Email (opcional)"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Período da hospedagem (ex: 20 a 25 Out)"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
                value={formData.periodo_hospedagem}
                onChange={e => setFormData({ ...formData, periodo_hospedagem: e.target.value })}
              />
            </div>
          </div>

          <div className="relative">
            <Home className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
            <select
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 transition-all outline-none appearance-none"
              value={formData.hotel}
              onChange={e => setFormData({ ...formData, hotel: e.target.value })}
            >
              <option value="" disabled>Selecione o Hotel onde ficou hospedado *</option>
              {HOTELS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        {/* Step 2: Quality Questions */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm">2</div>
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Sua Experiência</h2>
          </div>

          <RatingScale 
            label="1. Como você avalia sua hospedagem de forma geral?" 
            value={formData.satisfacao_hospedagem} 
            onChange={v => setFormData({...formData, satisfacao_hospedagem: v})}
          />
          <RatingScale 
            label="2. Como você avalia o atendimento da equipe do hotel?" 
            value={formData.atendimento_hotel} 
            onChange={v => setFormData({...formData, atendimento_hotel: v})}
          />
          <RatingScale 
            label="3. Como você avalia o atendimento da equipe do parque?" 
            value={formData.atendimento_parque} 
            onChange={v => setFormData({...formData, atendimento_parque: v})}
          />
          <RatingScale 
            label="4. Como você avalia o lazer, estrutura e conforto do local onde ficou hospedado?" 
            value={formData.lazer_structure} 
            onChange={v => setFormData({...formData, lazer_structure: v})}
          />
          <RatingScale 
            label="5. Como você avalia a apresentação do produto Lagoa Experience?" 
            value={formData.apresentacao_produto} 
            onChange={v => setFormData({...formData, apresentacao_produto: v})}
          />
          <RatingScale 
            label="6. O consultor apresentou as informações de forma clara e respeitosa?" 
            value={formData.clareza_consultor} 
            onChange={v => setFormData({...formData, clareza_consultor: v})}
          />
          <RatingScale 
            label="7. A experiência entregue correspondeu ao que foi apresentado no momento da reserva?" 
            value={formData.expectativa_entregue} 
            onChange={v => setFormData({...formData, expectativa_entregue: v})}
          />
        </div>

        {/* Step 3: NPS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm">3</div>
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Recomendação</h2>
          </div>

          <label className="text-base font-semibold text-slate-700 leading-snug">
            De 0 a 10, qual a probabilidade de você recomendar a experiência Lagoa Experience para um amigo ou familiar?
          </label>
          
          <NpsScale 
            value={formData.nota_nps} 
            onChange={v => setFormData({...formData, nota_nps: v})}
          />
        </div>

        {/* Step 4: Final Comment */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <label className="text-base font-semibold text-slate-700">
            Gostaria de pontuar algo mais sobre sua experiência?
          </label>
          <textarea
            placeholder="Seu comentário aqui (opcional)"
            rows={4}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none"
            value={formData.comentario_final}
            onChange={e => setFormData({ ...formData, comentario_final: e.target.value })}
          />
        </div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl font-medium text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full py-5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-sky-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed",
            loading && "animate-pulse"
          )}
        >
          {loading ? "Enviando..." : (
            <>
              Enviar avaliação
              <Send size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
