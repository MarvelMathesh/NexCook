import { createContext, useContext, ReactNode } from 'react';
import { useAmbientSound } from '../../hooks/useAmbientSound';

interface AmbientSoundContextType {
  isPlaying: boolean;
  isLoaded: boolean;
  error: string | null;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => void;
  setVolume: (volume: number) => void;
}

const AmbientSoundContext = createContext<AmbientSoundContextType | null>(null);

interface AmbientSoundProviderProps {
  children: ReactNode;
}

export const AmbientSoundProvider = ({ children }: AmbientSoundProviderProps) => {
  const ambientSound = useAmbientSound('/assets/sounds/sound.mp3', {
    volume: 0.15, // Subtle ambient volume
    loop: true
  });

  return (
    <AmbientSoundContext.Provider value={ambientSound}>
      {children}
    </AmbientSoundContext.Provider>
  );
};

export const useAmbientSoundContext = () => {
  const context = useContext(AmbientSoundContext);
  if (!context) {
    throw new Error('useAmbientSoundContext must be used within an AmbientSoundProvider');
  }
  return context;
};
