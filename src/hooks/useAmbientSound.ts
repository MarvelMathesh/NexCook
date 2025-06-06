import { useEffect, useRef, useState, useCallback } from 'react';

interface AmbientSoundOptions {
  volume?: number;
  loop?: boolean;
}

export const useAmbientSound = (
  soundPath: string, 
  options: AmbientSoundOptions = {}
) => {
  const { volume = 0.15, loop = true } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true); // Default to true (unmuted)
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  // Play function
  const play = useCallback(async () => {
    if (!audioRef.current) return;
    
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to play ambient sound:', err);
      setError('Playback failed');
    }
  }, []);

  // Pause function
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Toggle function
  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Set up user interaction listener to start audio
  useEffect(() => {
    if (userInteracted || !isLoaded) return;

    const startOnInteraction = () => {
      setUserInteracted(true);
      if (isPlaying) { // Only play if we want it to be playing (unmuted state)
        play();
      }
    };
    
    document.addEventListener('click', startOnInteraction, { once: true });
    document.addEventListener('keydown', startOnInteraction, { once: true });
    document.addEventListener('touchstart', startOnInteraction, { once: true });

    return () => {
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
      document.removeEventListener('touchstart', startOnInteraction);
    };
  }, [isLoaded, userInteracted, isPlaying, play]);

  useEffect(() => {
    // Create and configure audio element
    const audio = new Audio(soundPath);
    audio.volume = volume;
    audio.loop = loop;
    audio.preload = 'auto';
    audioRef.current = audio;

    // Event handlers
    const handleLoadedData = () => {
      setIsLoaded(true);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setError('Failed to load audio');
      console.error('Audio loading error');
    };

    // Attach event listeners
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    // Cleanup function
    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [soundPath, volume, loop]);

  // Volume control
  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  }, []);

  return {
    isPlaying,
    isLoaded,
    error,
    play,
    pause,
    toggle,
    setVolume
  };
};
