import { useRef, useCallback } from "react";

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  swipeOffset: number;
}

export function useSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold = 60
): SwipeHandlers {
  const startX = useRef(0);
  const currentX = useRef(0);
  const offsetRef = useRef(0);
  const swiping = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    swiping.current = true;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping.current) return;
    currentX.current = e.touches[0].clientX;
    offsetRef.current = currentX.current - startX.current;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!swiping.current) return;
    swiping.current = false;
    const diff = currentX.current - startX.current;
    // RTL: swipe right (positive diff) = "next" in RTL, swipe left = "prev"
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && onSwipeRight) onSwipeRight();
      else if (diff < 0 && onSwipeLeft) onSwipeLeft();
    }
    offsetRef.current = 0;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart, onTouchMove, onTouchEnd, swipeOffset: offsetRef.current };
}
