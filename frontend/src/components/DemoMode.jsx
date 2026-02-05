import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Settings, Maximize, Monitor } from 'lucide-react';

// Demo sequence for auto-cycling
const DEMO_SEQUENCE = [
  {
    id: 'intro',
    command: 'show status',
    title: 'System Overview',
    narration: 'Welcome to ATLAS Supply Chain OS. This is the command center where 5 autonomous AI agents manage your entire supply chain 24/7.',
    duration: 8000
  },
  {
    id: 'agents',
    command: 'show all agents',
    title: 'Autonomous AI Agents',
    narration: 'Meet your AI workforce: Demand Forecaster achieving 94% accuracy, Procurement Optimizer saving $2.4M, Logistics Router with quantum optimization, Risk Sentinel predicting failures 6 months ahead, and the ATLAS Orchestrator coordinating it all.',
    duration: 12000
  },
  {
    id: 'digital_twin',
    command: 'show digital twin',
    title: 'Digital Twin Simulation',
    narration: 'The Digital Twin provides real-time physics simulation of your supply chain. Click any node to trigger demand spikes and watch cascade effects propagate through your network.',
    duration: 10000
  },
  {
    id: 'quantum',
    command: 'show quantum optimization',
    title: 'Quantum Computing',
    narration: 'Our quantum-classical hybrid solver optimizes 200-node routing problems in 4.2 minutes instead of 24 hours, delivering 28% efficiency gains.',
    duration: 10000
  },
  {
    id: 'risk',
    command: 'show risk assessment',
    title: 'Risk Intelligence',
    narration: 'The Risk Sentinel monitors 847 suppliers across 4 tiers, predicting failures with 89% accuracy. Currently tracking 3 high-priority alerts.',
    duration: 10000
  },
  {
    id: 'supplier',
    command: 'show supplier network',
    title: 'Supplier Network',
    narration: 'Visualize your entire supplier ecosystem. Multi-tier relationships, risk indicators, and value flows all in one interactive graph.',
    duration: 10000
  },
  {
    id: 'blockchain',
    command: 'show blockchain',
    title: 'Blockchain Settlement',
    narration: 'Smart contracts automate 85% of supplier payments. Performance-based bonuses and penalties execute without human intervention.',
    duration: 10000
  },
  {
    id: 'timeline',
    command: 'show timeline',
    title: 'Decision Audit Trail',
    narration: 'Every AI decision is fully explainable. Complete audit trails ready for board review or regulatory inspection.',
    duration: 10000
  },
  {
    id: 'scenarios',
    command: 'show scenario planner',
    title: 'Scenario Planning',
    narration: 'What-if analysis for strategic planning. Simulate supplier failures, demand spikes, and geopolitical disruptions before they happen.',
    duration: 10000
  }
];

const DemoMode = ({ onCommand, isActive, onToggle }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showNarration, setShowNarration] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Speak narration
  const speak = useCallback((text) => {
    if (isMuted || !synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // Try to find a good voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    synthRef.current.speak(utterance);
  }, [isMuted]);

  // Execute current step
  const executeStep = useCallback((stepIndex) => {
    const step = DEMO_SEQUENCE[stepIndex];
    if (!step) return;

    // Execute the command
    onCommand(step.command);
    
    // Speak the narration
    speak(step.narration);
    
    // Reset progress
    setProgress(0);
  }, [onCommand, speak]);

  // Auto-advance logic
  useEffect(() => {
    if (!isPlaying) {
      clearInterval(timerRef.current);
      clearInterval(progressRef.current);
      return;
    }

    const step = DEMO_SEQUENCE[currentStep];
    const duration = step.duration;

    // Progress bar update
    const progressInterval = 100;
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (progressInterval / duration) * 100;
        return Math.min(newProgress, 100);
      });
    }, progressInterval);

    // Auto-advance to next step
    timerRef.current = setTimeout(() => {
      if (currentStep < DEMO_SEQUENCE.length - 1) {
        setCurrentStep(prev => prev + 1);
        executeStep(currentStep + 1);
      } else {
        // Loop back to start
        setCurrentStep(0);
        executeStep(0);
      }
    }, duration);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [isPlaying, currentStep, executeStep]);

  // Start/stop demo
  const togglePlay = () => {
    if (!isPlaying) {
      executeStep(currentStep);
    } else {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Navigation
  const goToStep = (index) => {
    setCurrentStep(index);
    if (isPlaying) {
      executeStep(index);
    }
  };

  const nextStep = () => {
    const next = (currentStep + 1) % DEMO_SEQUENCE.length;
    goToStep(next);
  };

  const prevStep = () => {
    const prev = currentStep === 0 ? DEMO_SEQUENCE.length - 1 : currentStep - 1;
    goToStep(prev);
  };

  if (!isActive) return null;

  const currentDemo = DEMO_SEQUENCE[currentStep];

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      <div className="bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-lg shadow-[0_0_40px_rgba(0,240,255,0.2)]">
        {/* Progress bar */}
        <div className="h-1 bg-white/10 rounded-t-lg overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-white/30'}`} />
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                {isPlaying ? 'DEMO RUNNING' : 'DEMO PAUSED'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/40">
                {currentStep + 1} / {DEMO_SEQUENCE.length}
              </span>
              <button 
                onClick={onToggle}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <Settings size={14} className="text-white/40" />
              </button>
            </div>
          </div>

          {/* Current step info */}
          <div className="mb-4">
            <h3 className="font-heading text-lg font-bold text-white mb-1">{currentDemo.title}</h3>
            {showNarration && (
              <p className="text-sm text-white/60 leading-relaxed">{currentDemo.narration}</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={prevStep}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <SkipBack size={18} className="text-white/60" />
              </button>
              <button
                onClick={togglePlay}
                className={`p-3 rounded-lg transition-colors ${
                  isPlaying 
                    ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/50' 
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50'
                }`}
              >
                {isPlaying ? (
                  <Pause size={20} className="text-red-400" />
                ) : (
                  <Play size={20} className="text-cyan-400" />
                )}
              </button>
              <button
                onClick={nextStep}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <SkipForward size={18} className="text-white/60" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-lg transition-colors ${
                  isMuted ? 'bg-red-500/20' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {isMuted ? (
                  <VolumeX size={16} className="text-red-400" />
                ) : (
                  <Volume2 size={16} className="text-white/60" />
                )}
              </button>
              <button
                onClick={() => setShowNarration(!showNarration)}
                className={`p-2 rounded-lg transition-colors ${
                  showNarration ? 'bg-cyan-500/20' : 'bg-white/5'
                }`}
              >
                <Monitor size={16} className={showNarration ? 'text-cyan-400' : 'text-white/40'} />
              </button>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex gap-1 mt-4 justify-center">
            {DEMO_SEQUENCE.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => goToStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep 
                    ? 'bg-cyan-400 w-6' 
                    : idx < currentStep 
                      ? 'bg-cyan-400/50' 
                      : 'bg-white/20'
                }`}
                title={step.title}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoMode;
