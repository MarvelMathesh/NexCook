import { useEffect, useRef, useState } from 'react';

interface AmbientSoundOptions {
  volume?: number;
  autoPlay?: boolean;
  loop?: boolean;
}

export const useAmbientSound = (
  soundPath: string, 
  options: AmbientSoundOptions = {}
) => {
  const {
    volume = 0.3,
    autoPlay = true,
    loop = true
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(soundPath);
    audio.volume = volume;
    audio.loop = loop;
    audio.preload = 'auto';
    
    audioRef.current = audio;

    // Event handlers
    const handleCanPlayThrough = () => {
      setIsLoaded(true);
      if (autoPlay) {
        play();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      setError('Failed to load ambient sound');
      console.error('Ambient sound error:', e);
    };

    // Add event listeners
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      // Cleanup
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, [soundPath, volume, loop, autoPlay]);

  const play = async () => {
    if (audioRef.current && isLoaded) {
      try {
        await audioRef.current.play();
      } catch (err) {
        setError('Failed to play ambient sound');
        console.error('Play error:', err);
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggle = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const setVolumeLevel = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  };

  return {
    isPlaying,
    isLoaded,
    error,
    play,
    pause,
    toggle,
    setVolume: setVolumeLevel
  };
};
