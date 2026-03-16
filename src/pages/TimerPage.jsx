import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  SkipForward,
  SkipBack,
  Pause,
  Play,
  ChevronRight
} from 'lucide-react';

export default function TimerPage({ activities, currentIndex, timeLeft, isActive, setIsActive, isPreStart, onClose, onSkip }) {
  const currentActivity = currentIndex === -1 ? { name: "Prepare-se!", durationSeconds: 5 } : activities[currentIndex];
  const nextActivity = currentIndex < activities.length - 1 ? activities[currentIndex + 1] : null;

  const totalSecondsForCircle = isPreStart ? 5 : currentActivity.durationSeconds;
  const progress = (timeLeft / totalSecondsForCircle) * 100;
  const isLastSeconds = timeLeft <= 5 && timeLeft > 0;

  const formatTime = (seconds) => {
    if (isPreStart) return seconds;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStrokeDashOffset = () => {
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    return circumference - (progress / 100) * circumference;
  };

  const totalTimeLeft = activities.slice(Math.max(0, currentIndex)).reduce((acc, c) => acc + c.durationSeconds, 0) - (currentIndex === -1 ? 0 : (totalSecondsForCircle - timeLeft));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className={`flex-1 flex flex-col relative overflow-hidden bg-background-dark ${isLastSeconds ? 'alert-flash' : ''}`}
    >
      {/* Top App Bar */}
      <div className="flex items-center p-4 justify-between z-20">
        <button
          onClick={onClose}
          className="text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
          {currentIndex === -1 ? 'Sessão Iniciando' : `${currentIndex + 1} de ${activities.length}`}
        </h2>
      </div>

      {/* Timer Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 z-10 w-full">
        <div className="relative inline-flex items-center justify-center mb-6">
          {/* Progress Circle */}
          <svg className="w-72 h-72 transform -rotate-90">
            <circle
              className="text-white/5"
              cx="144" cy="144" r="120"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
            />
            <motion.circle
              className="text-primary"
              cx="144" cy="144" r="120"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 120}
              animate={{ strokeDashoffset: getStrokeDashOffset() }}
              transition={{ ease: "linear", duration: 1 }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.h1
              key={timeLeft}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-white text-[90px] font-black leading-none tabular-nums"
            >
              {timeLeft < 60 ? timeLeft : formatTime(timeLeft)}
            </motion.h1>
            <span className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase mt-2 opacity-80">
              {isPreStart ? 'Segundos para começar' : 'Tempo Restante'}
            </span>
          </div>
        </div>

        {/* Activity Details */}
        <div className="mt-4 text-center w-full px-6">
          <h4 className="text-primary/60 text-[10px] font-black leading-normal tracking-[0.3em] uppercase mb-1">PROCESSO ATUAL</h4>
          <h1 className="text-white text-3xl font-extrabold leading-tight tracking-tight break-words">{currentActivity.name}</h1>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-8 w-full px-4">
          <div className="flex flex-1 flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Etapa</span>
            <p className="text-white text-xl font-bold">{currentIndex === -1 ? 0 : currentIndex + 1} / {activities.length}</p>
          </div>
          <div className="flex flex-1 flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Segundos Restantes</span>
            <p className="text-white text-xl font-bold">
              {Math.max(0, Math.ceil(totalTimeLeft))}
            </p>
          </div>
        </div>
      </main>

      {/* Footer / Next Activity */}
      <footer className="p-6 pb-12 z-10 w-full mt-auto">
        <div className="max-w-xs mx-auto mb-8">
          <AnimatePresence mode="wait">
            {nextActivity ? (
              <motion.div
                key={nextActivity.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Próxima Etapa</span>
                  <div className="size-2 rounded-full bg-primary animate-pulse" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <SkipForward size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm truncate">{nextActivity.name}</h3>
                    <p className="text-slate-500 text-[10px]">{nextActivity.durationSeconds} segundos</p>
                  </div>
                  <button onClick={onSkip} className="text-slate-400 hover:text-white transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            ) : (
                <div className="h-20" /> /* Spacer if no next activity */
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8">
          <button className="size-14 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:bg-white/5 hover:text-white transition-all disabled:opacity-20 cursor-not-allowed">
            <SkipBack size={24} />
          </button>
          <button
            onClick={() => setIsActive(!isActive)}
            className="size-20 rounded-full bg-primary flex items-center justify-center text-[#102219] shadow-[0_0_30px_rgba(17,212,115,0.3)] hover:scale-105 active:scale-95 transition-all"
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
          </button>
          <button
            onClick={onSkip}
            className="size-14 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:bg-white/5 hover:text-white transition-all"
          >
            <SkipForward size={24} />
          </button>
        </div>
      </footer>
    </motion.div>
  );
}
