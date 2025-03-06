import { useEffect } from 'react';
import { useReactFlow } from 'reactflow';

export const useKeyboardNavigation = () => {
  const { setViewport, getViewport } = useReactFlow();

  useEffect(() => {
    const handleKeyDown = (event) => {
      const PAN_AMOUNT = 100; // Pixels to pan per keypress
      const currentViewport = getViewport();

      switch (event.key) {
        case 'ArrowUp':
          setViewport({
            ...currentViewport,
            y: currentViewport.y + PAN_AMOUNT
          });
          break;
        case 'ArrowDown':
          setViewport({
            ...currentViewport,
            y: currentViewport.y - PAN_AMOUNT
          });
          break;
        case 'ArrowLeft':
          setViewport({
            ...currentViewport,
            x: currentViewport.x + PAN_AMOUNT
          });
          break;
        case 'ArrowRight':
          setViewport({
            ...currentViewport,
            x: currentViewport.x - PAN_AMOUNT
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setViewport, getViewport]);
};