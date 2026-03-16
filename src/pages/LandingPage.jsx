import React from 'react';
import { motion } from 'framer-motion';
import { Play, Settings, Clock, Zap } from 'lucide-react';

const LandingPage = ({ onGetStarted, onStartSequence, hasActivities }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-between p-8 bg-background-dark overflow-hidden relative"
    >
      {/* Visual Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-5%] left-[-10%] w-48 h-48 bg-primary/5 rounded-full blur-2xl" />

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 p-4 rounded-3xl bg-primary/10 border border-primary/20"
        >
          <Clock size={48} className="text-primary" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-black tracking-tighter mb-4 text-white"
        >
          Cron<span className="text-primary">Task</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-slate-400 max-w-[280px] leading-relaxed"
        >
          Otimize sua rotina com sequências de atividades de alta performance.
        </motion.p>
      </div>

      {/* Buttons Section */}
      <div className="w-full space-y-4 z-10 pb-8">
        {hasActivities && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartSequence}
            className="w-full bg-primary text-background-dark font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(17,212,115,0.3)] transition-all"
          >
            <Play size={24} fill="currentColor" />
            <span className="text-lg uppercase tracking-wider">Continuar Sequência</span>
          </motion.button>
        )}

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGetStarted}
          className={`w-full ${hasActivities ? 'bg-white/5 border border-white/10 text-white' : 'bg-primary text-background-dark shadow-[0_10px_40px_rgba(17,212,115,0.3)]'} font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all`}
        >
          {hasActivities ? <Settings size={24} /> : <Zap size={24} fill="currentColor" />}
          <span className="text-lg uppercase tracking-wider">
            {hasActivities ? 'Configurar Nova' : 'Começar Agora'}
          </span>
        </motion.button>
      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mb-4"
      >
        Design Premium • v2.0
      </motion.div>
    </motion.div>
  );
};

export default LandingPage;