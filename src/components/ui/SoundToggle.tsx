import { Volume2, VolumeX } from 'lucide-react';
import { useAmbientSoundContext } from './AmbientSoundProvider';

export const SoundToggle = () => {
  const { isPlaying, toggle, isLoaded, error } = useAmbientSoundContext();

  if (!isLoaded || error) return null;
  return (
    <button
      onClick={toggle}
      className="fixed top-4 left-4 z-50 w-8 h-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center hover:bg-white/15 transition-all duration-300"
      title={isPlaying ? 'Mute ambient sound' : 'Unmute ambient sound'}
    >
      {isPlaying ? (
        <Volume2 className="w-3 h-3 text-white/80" />
      ) : (
        <VolumeX className="w-3 h-3 text-white/50" />
      )}
    </button>
  );
};
