import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import cyberSound from '../utils/CyberSoundEngine';

const SoundToggle = () => {
  const [enabled, setEnabled] = useState(true);

  const handleToggle = () => {
    cyberSound.init();
    const newState = cyberSound.toggle();
    setEnabled(newState);
    if (newState) {
      cyberSound.playClick();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg bg-black/30 border border-white/10 hover:border-cyan-500/30 transition-all"
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {enabled ? (
        <Volume2 size={18} className="text-cyan-400" />
      ) : (
        <VolumeX size={18} className="text-white/40" />
      )}
    </button>
  );
};

export default SoundToggle;
