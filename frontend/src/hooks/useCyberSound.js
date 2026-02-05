import { useEffect, useCallback } from 'react';
import cyberSound from '../utils/CyberSoundEngine';

/**
 * Hook to use Cyber Sound Engine in React components
 */
export const useCyberSound = () => {
  // Initialize on first user interaction
  useEffect(() => {
    const initAudio = () => {
      cyberSound.init();
      // Play boot sequence on first init
      if (!window.__cyberSoundBooted) {
        window.__cyberSoundBooted = true;
        setTimeout(() => cyberSound.playBootSequence(), 100);
      }
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
  }, []);

  const playClick = useCallback(() => cyberSound.playClick(), []);
  const playKeystroke = useCallback(() => cyberSound.playKeystroke(), []);
  const playProcessing = useCallback((duration) => cyberSound.playProcessing(duration), []);
  const playSuccess = useCallback(() => cyberSound.playSuccess(), []);
  const playWarning = useCallback(() => cyberSound.playWarning(), []);
  const playCritical = useCallback(() => cyberSound.playCritical(), []);
  const playGlitch = useCallback(() => cyberSound.playGlitch(), []);
  const playHover = useCallback(() => cyberSound.playHover(), []);
  const playTransmit = useCallback(() => cyberSound.playTransmit(), []);
  const toggle = useCallback(() => cyberSound.toggle(), []);
  const setVolume = useCallback((vol) => cyberSound.setVolume(vol), []);

  return {
    playClick,
    playKeystroke,
    playProcessing,
    playSuccess,
    playWarning,
    playCritical,
    playGlitch,
    playHover,
    playTransmit,
    toggle,
    setVolume,
  };
};

export default useCyberSound;
