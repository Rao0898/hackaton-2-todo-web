'use client';

import { useEffect, useState } from 'react';

const TypewriterComponent = () => {
  const texts = ['Master Your Time', 'Elevate Your Work', 'Achieve True Potential'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const currentWord = texts[currentIndex];

    if (isDeleting) {
      // Deleting text
      if (currentText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentText.substring(0, currentText.length - 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Finished deleting, move to next word
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setTypingSpeed(150);
      }
    } else {
      // Typing text
      if (currentText.length < currentWord.length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentWord.substring(0, currentText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, pause then start deleting
        const timeout = setTimeout(() => {
          setIsDeleting(true);
          setTypingSpeed(100);
        }, 1000); // Pause for 1 second before deleting
        return () => clearTimeout(timeout);
      }
    }
  }, [currentText, isDeleting, currentIndex, typingSpeed, texts]);

  return (
    <div className="text-5xl md:text-7xl text-[#F5F5DC] font-bold tracking-tighter h-24 flex items-center">
      {currentText}
      <span className="ml-2 text-5xl md:text-7xl animate-pulse">|</span>
    </div>
  );
};

export default TypewriterComponent;