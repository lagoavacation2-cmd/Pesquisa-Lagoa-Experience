import { CheckCircle2, Ticket } from 'lucide-react';
import { motion } from 'motion/react';

export default function ThankYouScreen() {
  const WHATSAPP_LINK = "https://wa.me/556435136220?text=Quero%20usar%20meu%20cupom%20de%2010%25%20da%20pesquisa.";
  const BUTTON_IMAGE_URL = "https://i.postimg.cc/JhYhfxkY/image.png";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[44px] shadow-2xl shadow-sky-200/40 p-8 sm:p-12 text-center border border-sky-50 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 size={32} strokeWidth={2} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl sm:text-2xl font-black text-[#003B73] mb-8 leading-tight"
        >
          Obrigado por finalizar a pesquisa!
        </motion.h2>

        {/* VISUAL CUPOM */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative mb-8"
        >
          <div className="bg-gradient-to-br from-sky-50 to-white border-2 border-dashed border-sky-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            {/* Ticket Cutouts */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white border-r-2 border-dashed border-sky-200 rounded-full -translate-y-1/2 shadow-inner" />
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white border-l-2 border-dashed border-sky-200 rounded-full -translate-y-1/2 shadow-inner" />
            
            <div className="flex flex-col items-center">
              <div className="bg-sky-600 text-white p-2 rounded-full mb-3 shadow-md">
                <Ticket size={24} />
              </div>
              <div className="text-4xl sm:text-5xl font-black text-[#0077B6] tracking-tighter mb-1">
                10%
              </div>
              <div className="text-[#003B73] font-black text-sm sm:text-base uppercase tracking-widest mb-4">
                DE DESCONTO EM HOSPEDAGEM
              </div>
              
              <div className="bg-[#003B73] text-white px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm">
                Validade: 06 meses
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">
            Para realizar sua reserva, clique no botão abaixo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          className="flex flex-col items-center"
        >
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group block relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-0 group-hover:opacity-30 transition-opacity rounded-full" />
            
            <img 
              src={BUTTON_IMAGE_URL} 
              alt="Reservar pelo WhatsApp" 
              className="w-[240px] sm:w-[320px] h-auto object-contain cursor-pointer transition-all duration-500 transform group-hover:scale-105 group-active:scale-95 drop-shadow-xl group-hover:drop-shadow-2xl"
            />
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
