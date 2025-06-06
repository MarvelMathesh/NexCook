import { Volume2, VolumeX } from 'lucide-react';
import { useAmbientSoundContext } from './AmbientSoundProvider';

export const SoundToggle = () => {
  const { isPlaying, toggle, isLoaded } = useAmbientSoundContext();

  if (!isLoaded) return null;

  return (
    <button
      onClick={toggle}
      className="fixed top-6 right-6 z-50 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 shadow-lg group"
      title={isPlaying ? 'Mute ambient sound' : 'Unmute ambient sound'}
    >
      {isPlaying ? (
        <Volume2 className="w-5 h-5 text-white group-hover:text-purple-300 transition-colors" />
      ) : (
        <VolumeX className="w-5 h-5 text-white/60 group-hover:text-purple-300 transition-colors" />
      )}
    </button>
  );
};
