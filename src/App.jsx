import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Timer, 
  Plus, 
  Trash2, 
  Play, 
  X, 
  ChevronRight, 
  Pause, 
  SkipBack, 
  SkipForward 
} from 'lucide-react';

const STORAGE_KEY = 'crontask_activities';

export default function App() {
  const [view, setView] = useState('config'); // 'config' or 'timer'
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [currentActivityIndex, setCurrentActivityIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [isPreStart, setIsPreStart] = useState(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  const addActivity = (name, durationMinutes) => {
    const newActivity = {
      id: Date.now(),
      name,
      durationMinutes: parseFloat(durationMinutes)
    };
    setActivities([...activities, newActivity]);
  };

  const deleteActivity = (id) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const clearAll = () => {
    if (window.confirm('Limpar todas as tarefas?')) {
      setActivities([]);
    }
  };

  const startSequence = () => {
    if (activities.length === 0) return;
    setView('timer');
    setCurrentActivityIndex(-1);
    setTimeLeft(5);
    setIsActive(true);
    setIsPreStart(true);
  };

  const quitTimer = () => {
    setIsActive(false);
    setView('config');
  };

  const nextActivity = useCallback(() => {
    if (currentActivityIndex < activities.length - 1) {
      const nextIdx = currentActivityIndex + 1;
      setCurrentActivityIndex(nextIdx);
      setTimeLeft(activities[nextIdx].durationMinutes * 60);
      setIsPreStart(false);
    } else {
      setIsActive(false);
      alert("Sequência concluída!");
      setView('config');
    }
  }, [currentActivityIndex, activities]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      nextActivity();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, nextActivity]);

  return (
    <div className="bg-[#0a0f0d] min-h-screen text-white font-display flex flex-col items-center selection:bg-primary selection:text-background-dark">
      <div className="w-full max-w-md bg-background-dark shadow-2xl relative min-h-screen flex flex-col border-x border-white/5 mx-auto">
        <AnimatePresence mode="wait">
          {view === 'config' ? (
            <ConfigView 
              key="config"
              activities={activities} 
              onAdd={addActivity} 
              onDelete={deleteActivity} 
              onClear={clearAll}
              onStart={startSequence} 
            />
          ) : (
            <TimerView 
              key="timer"
              activities={activities}
              currentIndex={currentActivityIndex}
              timeLeft={timeLeft}
              isActive={isActive}
              setIsActive={setIsActive}
              isPreStart={isPreStart}
              onClose={quitTimer}
              onSkip={() => nextActivity()}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ConfigView({ activities, onAdd, onDelete, onClear, onStart }) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !duration) return;
    onAdd(name, duration);
    setName('');
    setDuration('');
  };

  const totalTime = Math.round(activities.reduce((acc, curr) => acc + curr.durationMinutes, 0) * 100) / 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col h-full bg-background-dark"
    >
      {/* Top Navigation */}
      <div className="flex items-center p-4 border-b border-white/10 shrink-0">
        <button className="p-2 -ml-2 rounded-full hover:bg-primary/10 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold ml-2">Configurar Sequência</h1>
        {activities.length > 0 && (
          <button 
            onClick={onClear}
            className="ml-auto p-2 text-danger opacity-60 hover:opacity-100 hover:bg-danger/10 rounded-full transition-all"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-40">
        {/* Header Section */}
        <div className="pt-6 pb-2">
          <h2 className="text-2xl font-bold tracking-tight">Nova Atividade</h2>
          <p className="text-sm text-primary/60 mt-1">Crie seu fluxo personalizado</p>
        </div>

        {/* Input Form */}
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">O que fazer (máx 180 car.)</label>
            <input 
              className="w-full rounded-lg border border-primary/20 bg-primary/5 text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-all outline-none"
              maxLength={180}
              placeholder="Ex: Alongamento Matinal"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Duração (minutos)</label>
            <div className="flex">
              <input 
                className="flex-1 rounded-l-lg border border-primary/20 bg-primary/5 text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 border-r-0 outline-none"
                placeholder="5"
                type="number"
                step="0.1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <div className="flex items-center px-4 bg-primary/10 border border-l-0 border-primary/20 rounded-r-lg text-primary">
                <Timer size={20} />
              </div>
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            className="w-full bg-primary/20 hover:bg-primary/30 text-primary font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-2"
          >
            <Plus size={20} />
            <span>Adicionar Etapa</span>
          </button>
        </div>

        {/* Task List Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Sequência Atual</h3>
            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-bold">
              {activities.length} {activities.length === 1 ? 'Etapa' : 'Etapas'}
            </span>
          </div>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={activity.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20 group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">{index + 1}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{activity.name}</h4>
                  <p className="text-xs text-slate-400">{activity.durationMinutes} minutos</p>
                </div>
                <button 
                  onClick={() => onDelete(activity.id)}
                  className="text-slate-400 hover:text-danger transition-colors p-2"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-12 text-slate-500 italic text-sm border border-dashed border-white/10 rounded-2xl">
                Nenhuma atividade adicionada ainda.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-background-dark/95 border-t border-white/10 pb-10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-sm font-medium text-slate-500">Duração Total:</span>
          <span className="text-base font-bold text-primary">{totalTime} minutos</span>
        </div>
        <button 
          onClick={onStart}
          disabled={activities.length === 0}
          className="w-full bg-primary hover:bg-primary/90 text-background-dark font-black py-4 rounded-xl shadow-[0_8px_30px_rgb(17,212,115,0.3)] flex items-center justify-center gap-2 transform active:scale-95 transition-all text-lg uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={24} fill="currentColor" />
          <span>Iniciar Sequência</span>
        </button>
      </div>
    </motion.div>
  );
}

function TimerView({ activities, currentIndex, timeLeft, isActive, setIsActive, isPreStart, onClose, onSkip }) {
  const currentActivity = currentIndex === -1 ? { name: "Prepare-se!", durationMinutes: 5/60 } : activities[currentIndex];
  const nextActivity = currentIndex < activities.length - 1 ? activities[currentIndex + 1] : null;

  const totalSecondsForCircle = isPreStart ? 5 : currentActivity.durationMinutes * 60;
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

  const totalTimeLeft = activities.slice(Math.max(0, currentIndex)).reduce((acc, c) => acc + c.durationMinutes * 60, 0) - (currentIndex === -1 ? 0 : (totalSecondsForCircle - timeLeft));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Minutos Restantes</span>
            <p className="text-white text-xl font-bold">
              {Math.max(0, Math.ceil(totalTimeLeft / 60))}
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
                    <p className="text-slate-500 text-[10px]">{nextActivity.durationMinutes} minutos</p>
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
          <button className="size-14 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:bg-white/5 hover:text-white transition-all">
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
