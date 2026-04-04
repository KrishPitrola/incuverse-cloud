import { useState, useEffect } from 'react';

const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('scroll-trigger');
      if (element) {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = threshold;
        
        if (elementTop < window.innerHeight - elementVisible) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isVisible;
};

export default useScrollAnimation;
