import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';

import LandingPage from './pages/LandingPage';
import ConfigPage from './pages/ConfigPage';
import TimerPage from './pages/TimerPage';

const STORAGE_KEY = 'crontask_activities';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing', 'config' or 'timer'
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

  const addActivity = (name, durationSeconds, bothSides = false, addInterval = false, intervalSeconds = 5) => {
    const list = [];
    const duration = parseFloat(durationSeconds);
    const breakDuration = parseFloat(intervalSeconds);

    if (bothSides) {
      list.push({
        id: `${Date.now()}-r`,
        name: `${name} (Direito)`,
        durationSeconds: duration
      });
      if (addInterval) {
        list.push({
          id: `${Date.now()}-ri`,
          name: `Descanso`,
          durationSeconds: breakDuration,
          isBreak: true
        });
      }
      list.push({
        id: `${Date.now()}-l`,
        name: `${name} (Esquerdo)`,
        durationSeconds: duration
      });
      if (addInterval) {
        list.push({
          id: `${Date.now()}-li`,
          name: `Descanso`,
          durationSeconds: breakDuration,
          isBreak: true
        });
      }
    } else {
      list.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        durationSeconds: duration
      });
      if (addInterval) {
        list.push({
          id: `${Date.now()}-i`,
          name: `Descanso`,
          durationSeconds: breakDuration,
          isBreak: true
        });
      }
    }
    setActivities(prev => [...prev, ...list]);
  };

  const deleteActivity = (id) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const moveActivity = (id, direction) => {
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === activities.length - 1) return;

    const newActivities = [...activities];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newActivities[index], newActivities[targetIndex]] = [newActivities[targetIndex], newActivities[index]];
    setActivities(newActivities);
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

  const goToConfig = () => {
    setView('config');
  };

  const goToLanding = () => {
    setView('landing');
  };

  const quitTimer = () => {
    setIsActive(false);
    setView('config');
  };

  const nextActivity = useCallback(() => {
    if (currentActivityIndex < activities.length - 1) {
      const nextIdx = currentActivityIndex + 1;
      setCurrentActivityIndex(nextIdx);
      setTimeLeft(activities[nextIdx].durationSeconds);
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
      const timer = setTimeout(() => {
        nextActivity();
      }, 0);
      return () => clearTimeout(timer);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, nextActivity]);

  return (
    <div className="bg-[#0a0f0d] min-h-screen text-white font-display flex flex-col items-center selection:bg-primary selection:text-background-dark">
      <div className="w-full max-w-md bg-background-dark shadow-2xl relative min-h-screen flex flex-col border-x border-white/5 mx-auto overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'landing' ? (
            <LandingPage 
              key="landing" 
              onGetStarted={goToConfig} 
              onStartSequence={startSequence}
              hasActivities={activities.length > 0}
            />
          ) : view === 'config' ? (
            <ConfigPage
              key="config"
              activities={activities}
              onAdd={addActivity}
              onDelete={deleteActivity}
              onMove={moveActivity}
              onClear={clearAll}
              onStart={startSequence}
              onBack={goToLanding}
            />
          ) : (
            <TimerPage
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
