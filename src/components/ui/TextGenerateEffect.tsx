import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/animations";

// Word wrapper
const WordWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span className={cn("inline-block", className)}>
      {children}&nbsp;
    </span>
  );
};

export const TextGenerateEffect = ({
  words,
  className,
  textClassName = "",
}: {
  words: string;
  className?: string;
  textClassName?: string;
}) => {
  const [wordArray, setWordArray] = useState<string[]>([]);
  const [completedWords, setCompletedWords] = useState<boolean[]>([]);

  useEffect(() => {
    // Split by word
    const wordsArray = words.trim().split(" ");
    setWordArray(wordsArray);
    setCompletedWords(new Array(wordsArray.length).fill(false));

    // Animate each word
    let currentWordIndex = 0;
    const interval = setInterval(() => {
      if (currentWordIndex < wordsArray.length) {
        setCompletedWords(prev => {
          const newArray = [...prev];
          newArray[currentWordIndex] = true;
          return newArray;
        });
        currentWordIndex++;
      } else {
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [words]);

  return (
    <div className={cn("font-bold", className)}>
      {wordArray.map((word, idx) => (
        <WordWrapper key={`${word}-${idx}`} className={textClassName}>
          <motion.span
            initial={{ opacity: 0 }}
            animate={completedWords[idx] ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {word}
          </motion.span>
        </WordWrapper>
      ))}
    </div>
  );
};