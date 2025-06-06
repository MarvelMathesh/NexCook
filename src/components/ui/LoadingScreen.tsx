import styled from 'styled-components';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
  details?: string[];
}

// Premium Pyramid Loader Component - Exact implementation from uiverse.io
const PremiumLoader = () => {
  return (
    <StyledWrapper>
      <div className="pyramid-loader">
        <div className="wrapper">
          <span className="side side1" />
          <span className="side side2" />
          <span className="side side3" />
          <span className="side side4" />
          <span className="shadow" />
        </div>  
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 300px;

  .pyramid-loader {
    position: relative;
    width: 300px;
    height: 300px;
    display: block;
    transform-style: preserve-3d;
    transform: rotateX(-20deg);
  }

  .wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    animation: spin 4s linear infinite;
  }

  @keyframes spin {
    100% {
      transform: rotateY(360deg);
    }
  }

  .pyramid-loader .wrapper .side {
    width: 70px;
    height: 70px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    transform-origin: center top;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  }

  .pyramid-loader .wrapper .side1 {
    transform: rotateZ(-30deg) rotateY(90deg);
    background: conic-gradient(#8B5CF6, #A855F7, #C084FC, #8B5CF6);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
  }

  .pyramid-loader .wrapper .side2 {
    transform: rotateZ(30deg) rotateY(90deg);
    background: conic-gradient(#A855F7, #C084FC, #DDD6FE, #A855F7);
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
  }

  .pyramid-loader .wrapper .side3 {
    transform: rotateX(30deg);
    background: conic-gradient(#C084FC, #DDD6FE, #F3F4F6, #C084FC);
    box-shadow: 0 0 20px rgba(192, 132, 252, 0.4);
  }

  .pyramid-loader .wrapper .side4 {
    transform: rotateX(-30deg);
    background: conic-gradient(#8B5CF6, #7C3AED, #A855F7, #8B5CF6);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
  }

  .pyramid-loader .wrapper .shadow {
    width: 60px;
    height: 60px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.1));
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    transform: rotateX(90deg) translateZ(-40px);
    filter: blur(12px);
    border-radius: 50%;
  }
`;

/**
 * Premium Apple-style Loading screen component
 */
export function LoadingScreen({ 
  message = 'Loading VIT Mitatronics...', 
  details = [] 
}: LoadingScreenProps) {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Ambient lighting effects - matching HomeScreen */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/10 to-transparent" />
      
      {/* Subtle animated background grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[size:50px_50px] animate-pulse" />
      </div>      {/* Main content container - Perfect centering */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
        <div className="flex flex-col items-center justify-center text-center max-w-md">
          
          {/* Premium Pyramid Loader - Perfectly Centered */}
          <motion.div 
            className="flex items-center justify-center mb-16"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <PremiumLoader />
          </motion.div>          {/* Main Message with Apple typography */}
          <motion.h1 
            className="text-2xl md:text-3xl font-light text-white mb-3 tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {message}
          </motion.h1>

          {/* Subtle subtitle */}
          <motion.p 
            className="text-sm text-white/60 mb-12 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Preparing your premium cooking experience
          </motion.p>

          {/* Loading Details with premium styling */}
          {details.length > 0 && (
            <motion.div 
              className="space-y-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {details.map((detail, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center justify-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + (index * 0.1) }}
                >
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" 
                       style={{ animationDelay: `${index * 0.2}s` }} />
                  <span className="text-white/70 text-sm font-light tracking-wide">{detail}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Minimalist progress indicator */}
          <motion.div 
            className="flex justify-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-white/40 rounded-full"
                animate={{ 
                  opacity: [0.4, 1, 0.4],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>

          {/* Apple-style loading text */}
          <motion.div 
            className="mt-12 text-xs text-white/40 font-light tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            VIT Mitatronics
          </motion.div>
        </div>
      </div>

      {/* Subtle bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}