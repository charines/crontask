import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Timer,
  Plus,
  Trash2,
  Play,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight
} from 'lucide-react';

export default function ConfigPage({ activities, onAdd, onDelete, onMove, onClear, onStart, onBack }) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [bothSides, setBothSides] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !duration) return;
    onAdd(name, duration, bothSides);
    setName('');
    setDuration('');
    setBothSides(false);
  };

  const totalTime = Math.round(activities.reduce((acc, curr) => acc + curr.durationSeconds, 0));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col h-full bg-background-dark"
    >
      {/* Top Navigation */}
      <div className="flex items-center p-4 border-b border-white/10 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-primary/10 transition-colors">
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
          <h2 className="text-2xl font-bold tracking-tight text-white">Nova Atividade</h2>
          <p className="text-sm text-primary/60 mt-1">Crie seu fluxo personalizado</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">O que fazer (máx 180 car.)</label>
            <input
              className="w-full rounded-lg border border-primary/20 bg-primary/5 text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-all outline-none placeholder:text-white/20"
              maxLength={180}
              placeholder="Ex: Alongamento Matinal"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Duração (segundos)</label>
            <div className="flex">
              <input
                className="flex-1 rounded-l-lg border border-primary/20 bg-primary/5 text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 border-r-0 outline-none placeholder:text-white/20"
                placeholder="30"
                type="number"
                step="1"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <div className="flex items-center px-4 bg-primary/10 border border-l-0 border-primary/20 rounded-r-lg text-primary">
                <Timer size={20} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5 cursor-pointer select-none transition-all hover:bg-primary/10" onClick={() => setBothSides(!bothSides)}>
            <div className={`w-10 h-6 rounded-full transition-colors relative ${bothSides ? 'bg-primary' : 'bg-white/10'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${bothSides ? 'left-5' : 'left-1'}`} />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-slate-300">Ambos os lados (Direito/Esquerdo)</span>
              <p className="text-[10px] text-primary/60">Cria 2 registros automaticamente</p>
            </div>
            <ArrowLeftRight size={18} className={bothSides ? 'text-primary' : 'text-slate-500'} />
          </div>

          <button
            type="submit"
            className="w-full bg-primary/20 hover:bg-primary/30 text-primary font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-2 active:scale-[0.98]"
          >
            <Plus size={20} />
            <span>Adicionar Etapa</span>
          </button>
        </form>

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
                className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors group"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">{index + 1}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{activity.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{activity.durationSeconds} segundos</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onMove(activity.id, 'up')}
                    disabled={index === 0}
                    className="text-slate-500 hover:text-primary transition-colors p-1 disabled:opacity-20"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => onMove(activity.id, 'down')}
                    disabled={index === activities.length - 1}
                    className="text-slate-500 hover:text-primary transition-colors p-1 disabled:opacity-20"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(activity.id)}
                    className="text-slate-500 hover:text-danger transition-colors p-1 ml-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
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
          <span className="text-base font-bold text-primary">{totalTime} segundos</span>
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
