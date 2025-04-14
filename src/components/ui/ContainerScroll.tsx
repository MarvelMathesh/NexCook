import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { cn } from "../../utils/animations";

export const ContainerScroll = ({
  titleComponent,
  children,
  className,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    const containerElement = containerRef.current;
    
    if (!scrollElement || !containerElement) return;
    
    const handleResize = () => {
      setScrollHeight(scrollElement.scrollHeight);
      setContainerHeight(containerElement.clientHeight);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const transform = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -scrollHeight + containerHeight]
  );

  const smoothTransform = useSpring(transform, {
    damping: 15,
    mass: 0.27,
    stiffness: 55,
  });

  return (
    <motion.div
      ref={containerRef}
      className={cn("h-[300vh] overflow-hidden relative", className)}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {titleComponent}
        <motion.div
          ref={scrollRef}
          style={{ y: smoothTransform }}
          className="relative w-full"
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};