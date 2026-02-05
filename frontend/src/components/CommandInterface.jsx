import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, Sparkles } from 'lucide-react';
import cyberSound from '../utils/CyberSoundEngine';

const CommandInterface = ({ onCommand, isLoading, response }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize audio on mount
  useEffect(() => {
    const initAudio = () => {
      cyberSound.init();
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    return () => document.removeEventListener('click', initAudio);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleVoice = () => {
    cyberSound.playClick();
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      cyberSound.playTransmit();
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      cyberSound.playProcessing(2);
      onCommand(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    // Play keystroke sound only for new characters
    if (newValue.length > input.length) {
      cyberSound.playKeystroke();
    }
    setInput(newValue);
  };

  // Quick commands - Series A Demo focused
  const quickCommands = [
    'Show all agents',
    'Digital twin',
    'Scenario planner',
    'Decision timeline',
    'Market data'
  ];

  return (
    <div data-testid="command-interface" className="command-interface">
      {/* Main Command Input */}
      <div className="command-wrapper">
        <form onSubmit={handleSubmit} className="command-input-container">
          <span className="command-prefix">›</span>
          <input
            ref={inputRef}
            data-testid="command-input"
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isListening ? 'Listening...' : 'Ask ATLAS... (e.g., "Show risk alerts", "Optimize routes", "Digital twin")'}
            className="command-main-input"
            disabled={isLoading}
          />
          
          {/* Voice Button */}
          <button
            type="button"
            data-testid="voice-btn"
            onClick={toggleVoice}
            className={`voice-btn ${isListening ? 'listening' : ''}`}
          >
            {isListening ? (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="voice-wave" />
                ))}
              </div>
            ) : (
              <Mic size={20} />
            )}
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            data-testid="submit-btn"
            disabled={!input.trim() || isLoading}
            className="absolute right-14 p-2 text-cyan-400 hover:text-cyan-300 disabled:text-white/20 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>

        {/* Quick Commands */}
        {!input && !isLoading && (
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {quickCommands.map((cmd) => (
              <button
                key={cmd}
                data-testid={`quick-cmd-${cmd.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  if (!isLoading) {
                    cyberSound.playClick();
                    cyberSound.playProcessing(2);
                    onCommand(cmd);
                  }
                }}
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-xs font-mono text-white/60 hover:text-cyan-400 transition-all"
              >
                {cmd}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Response Area */}
      {response && (
        <div 
          data-testid="command-response"
          className="response-area mt-4 slide-up"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex-shrink-0">
              <Sparkles size={16} className="text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-mono text-cyan-400 uppercase mb-2">ATLAS Response</p>
              <p className="response-text">{response}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="response-area mt-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-black/30 border border-white/10">
            <Loader2 size={16} className="text-white/60 animate-spin" />
          </div>
          <div>
            <p className="text-xs font-mono text-white/60 uppercase">Processing</p>
            <p className="text-sm text-white/60">Analyzing command and generating interface...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandInterface;
