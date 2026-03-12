import React, { useState, useEffect, useCallback } from 'react';
import { Play, Plus, X, Trash2, ArrowLeft, RotateCcw, SkipBack, SkipForward, Pause, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'crontask_activities';

export default function App() {
  const [view, setView] = useState('config'); // 'config' or 'timer'
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [currentActivityIndex, setCurrentActivityIndex] = useState(-1); // -1 means initial countdown
  const [timeLeft, setTimeLeft] = useState(5); // Initial countdown of 5 seconds
  const [isActive, setIsActive] = useState(false);
  const [isPreStart, setIsPreStart] = useState(true);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  const addActivity = (name, durationMinutes) => {
    if (name === 'CLEAR_ALL') {
      setActivities([]);
      return;
    }
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
      // Completed! TimerView handles completion state
      setIsActive(false);
    }
  }, [currentActivityIndex, activities]);

  // Timer logic
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
    <div className="app-container">
      <AnimatePresence mode="wait">
        {view === 'config' ? (
          <ConfigView 
            activities={activities} 
            onAdd={addActivity} 
            onDelete={deleteActivity} 
            onStart={startSequence} 
          />
        ) : (
          <TimerView 
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
  );
}

function ConfigView({ activities, onAdd, onDelete, onStart }) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !duration) return;
    onAdd(name, duration);
    setName('');
    setDuration('');
  };

  const totalTime = activities.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="view pb-32"
    >
      <header className="p-6 border-b border-white/5 flex items-center justify-between">
        <h1 className="text-xl font-bold">Configurar Sequência</h1>
        {activities.length > 0 && (
          <button 
            onClick={() => { if(confirm('Limpar todas as tarefas?')) onAdd('CLEAR_ALL'); }} 
            className="text-xs text-danger font-bold flex items-center gap-1 opacity-60 hover:opacity-100"
          >
            <Trash2 size={14} />
            Limpar
          </button>
        )}
      </header>

      <div className="p-6 space-y-8">
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Nova Atividade</h2>
            <p className="text-dim text-sm">Crie seu fluxo personalizado</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-dim">O que fazer (máx 180 car.)</label>
              <input 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Alongamento Matinal" 
                maxLength={180}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-dim">Duração (minutos)</label>
              <div className="relative">
                <input 
                  type="number"
                  step="0.1"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="5" 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                  <Timer size={20} />
                </div>
              </div>
            </div>

            <button type="submit" className="secondary-btn w-full">
              <Plus size={20} />
              Adicionar Etapa
            </button>
          </form>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Sequência Atual</h3>
            <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">
              {activities.length} Etapas
            </span>
          </div>

          <div className="space-y-3">
            {activities.map((activity, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={activity.id} 
                className="flex items-center gap-4 p-4 rounded-2xl glass border-primary/10"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{activity.name}</h4>
                  <p className="text-xs text-dim">{activity.durationMinutes} minutos</p>
                </div>
                <button onClick={() => onDelete(activity.id)} className="text-dim hover:text-danger">
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-10 text-dim italic text-sm">
                Nenhuma atividade adicionada ainda.
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] p-6 glass border-t border-white/5 pb-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-dim">Duração Total:</span>
          <span className="font-bold text-primary">{totalTime} minutos</span>
        </div>
        <button 
          onClick={onStart}
          disabled={activities.length === 0}
          className="primary-btn w-full disabled:opacity-50 disabled:grayscale"
        >
          <Play fill="currentColor" size={20} />
          Iniciar Sequência
        </button>
      </footer>
    </motion.div>
  );
}

function TimerView({ activities, currentIndex, timeLeft, isActive, setIsActive, isPreStart, onClose, onSkip }) {
  const [isFinished, setIsFinished] = useState(false);

  // Handle completion locally to show a nice screen
  useEffect(() => {
    if (currentIndex === activities.length - 1 && timeLeft === 0 && isActive) {
      setIsFinished(true);
      setIsActive(false);
    }
  }, [timeLeft, currentIndex, activities.length, isActive, setIsActive]);

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="view min-h-screen flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6 float">
          <Play fill="currentColor" size={48} />
        </div>
        <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">Pronto!</h1>
        <p className="text-dim mb-12">Você completou toda a sequência.</p>
        <button onClick={onClose} className="primary-btn w-full max-w-xs">
          Voltar ao Início
        </button>
      </motion.div>
    );
  }

  const currentActivity = currentIndex === -1 ? { name: "Ready?", durationMinutes: 0.1 } : activities[currentIndex];
  const nextActivity = currentIndex < activities.length - 1 ? activities[currentIndex + 1] : null;

  const totalSeconds = isPreStart ? 5 : currentActivity.durationMinutes * 60;
  const progress = (timeLeft / totalSeconds) * 100;
  const isLastSeconds = timeLeft <= 5 && timeLeft > 0;

  const formatTime = (seconds) => {
    if (isPreStart) return seconds;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`view min-h-screen flex flex-col transition-colors duration-300 ${isLastSeconds ? 'alert-flash' : ''}`}
    >
      <header className="p-6 flex items-center justify-between z-20">
        <button onClick={onClose} className="icon-btn">
          <X size={24} />
        </button>
        <h2 className="text-lg font-bold truncate px-4">Sessão Ativa</h2>
        <div className="w-11" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="relative w-80 h-80 flex items-center justify-center mb-12 animate-scale">
          {/* Progress ring with glow */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="rgba(var(--primary-rgb), 0.05)"
              strokeWidth="12"
              fill="none"
            />
            <motion.circle
              cx="160"
              cy="160"
              r="140"
              stroke="var(--primary)"
              strokeWidth="12"
              fill="none"
              strokeDasharray="880"
              animate={{ strokeDashoffset: 880 - (880 * progress) / 100 }}
              transition={{ ease: "linear", duration: 1 }}
              strokeLinecap="round"
              filter={isLastSeconds ? "url(#glow)" : ""}
            />
          </svg>

          <div className="text-center z-10">
            <AnimatePresence mode="wait">
              <motion.h1 
                key={timeLeft}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-[100px] font-black tabular-nums leading-none tracking-tighter ${isLastSeconds ? 'text-danger' : ''}`}
              >
                {isPreStart ? timeLeft : (formatTime(timeLeft).split(':')[1] || timeLeft)}
              </motion.h1>
            </AnimatePresence>
            {!isPreStart && (
               <p className="text-5xl font-bold text-dim/30 tabular-nums -mt-4">
                 {formatTime(timeLeft).split(':')[0]}:
               </p>
            )}
            <p className="text-primary font-black tracking-[0.3em] text-[10px] uppercase mt-4">
              {isPreStart ? "Iniciando em" : "Segundos Restantes"}
            </p>
          </div>
        </div>

        <div className="text-center px-4 w-full">
          <motion.div
            key={currentActivity.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h4 className="text-primary text-[10px] font-black tracking-[0.4em] uppercase mb-2 opacity-60">Atividade Atual</h4>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">{currentActivity.name}</h2>
          </motion.div>
          
          <div className="mt-10 flex gap-4 w-full justify-center">
             <div className="flex-1 max-w-[140px] glass p-4 rounded-3xl border-white/5">
                <p className="text-[10px] uppercase font-black text-dim tracking-wider mb-1">Etapa</p>
                <p className="text-xl font-bold">{currentIndex === -1 ? 0 : currentIndex + 1} / {activities.length}</p>
             </div>
             <div className="flex-1 max-w-[140px] glass p-4 rounded-3xl border-white/5">
                <p className="text-[10px] uppercase font-black text-dim tracking-wider mb-1">Total</p>
                <p className="text-xl font-bold">{Math.round(((currentIndex + 1) / activities.length) * 100)}%</p>
             </div>
          </div>
        </div>
      </main>

      <footer className="p-6 pb-12 z-20">
        <AnimatePresence>
          {nextActivity && (
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="glass p-6 rounded-[32px] border-white/5 flex items-center justify-between mb-8 overflow-hidden relative"
            >
              <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <SkipForward size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dim mb-1">Próxima Etapa</p>
                  <h3 className="font-bold text-lg">{nextActivity.name}</h3>
                  <p className="text-xs text-dim italic opacity-60">{nextActivity.durationMinutes} minutos</p>
                </div>
              </div>
              <button 
                onClick={onSkip} 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-dim hover:text-white"
              >
                <SkipForward size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-10">
          <button className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-dim hover:text-white" onClick={() => {
            if(currentIndex > 0) {
              // Backward logic can be added here if needed
            }
          }}>
            <SkipBack size={28} />
          </button>
          
          <button 
            className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-bg-dark shadow-[0_15px_45px_0_rgba(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all" 
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? <Pause size={40} fill="currentColor" /> : <Play fill="currentColor" size={40} />}
          </button>

          <button className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-dim hover:text-white" onClick={onSkip}>
            <SkipForward size={28} />
          </button>
        </div>
      </footer>
    </motion.div>
  );
}
