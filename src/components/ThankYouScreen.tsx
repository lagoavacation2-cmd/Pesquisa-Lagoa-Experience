import { CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ThankYouScreenProps {
  nps: number;
}

export default function ThankYouScreen({ nps }: ThankYouScreenProps) {
  const getMessage = () => {
    if (nps >= 9) return "Ficamos muito felizes em saber que sua experiência foi positiva!";
    if (nps >= 7) return "Obrigado pelo feedback! Vamos continuar trabalhando para encantar você ainda mais.";
    return "Agradecemos sua sinceridade. Sua avaliação será analisada com atenção pela nossa equipe.";
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl shadow-xl relative overflow-hidden border border-sky-50">
      <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl bg-sky-400 rounded-full w-64 h-64 -translate-y-1/2 translate-x-1/2"></div>
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="mb-6 text-emerald-500"
      >
        <CheckCircle2 size={80} strokeWidth={1.5} />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-slate-800 mb-4"
      >
        Obrigado por avaliar sua experiência!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-slate-600 mb-8 max-w-md"
      >
        Seu feedback nos ajuda a melhorar cada vez mais o Lagoa Experience.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-sky-50 p-6 rounded-2xl border border-sky-100"
      >
        <p className="text-sky-800 font-medium italic">
          "{getMessage()}"
        </p>
      </motion.div>
      
      <button 
        onClick={() => window.location.reload()}
        className="mt-12 text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
      >
        Enviar outra avaliação
      </button>
    </div>
  );
}
