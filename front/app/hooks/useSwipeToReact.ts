import { useState, useRef, useCallback, useEffect } from 'react';

const SWIPE_THRESHOLD = 100; // Minimum drag distance to trigger a swipe
const ANIMATION_DURATION = 200; // ms for snap-back or swipe-away animations

/**
 * The direction of a successful swipe action.
 * 'up' corresponds to a positive reaction (e.g., agree, like).
 * 'down' corresponds to a negative reaction (e.g., disagree, dislike).
 * 'neutral' corresponds to a third option (e.g., unsure, skip).
 */
export type SwipeDirection = 'up' | 'down' | 'neutral';

/**
 * Arguments for the useSwipeToReact hook.
 * @param onSwipe - A callback function that fires when a swipe gesture is completed.
 * It receives the direction of the swipe as its only argument.
 */
export interface UseSwipeToReactOptions {
  onSwipe: (direction: SwipeDirection) => void;
}

/**
 * The return value of the useSwipeToReact hook.
 */
export interface UseSwipeToReactReturn {
  /** The current drag offset from the starting point. */
  dragOffset: { x: number; y: number };
  /** The determined swipe direction based on the current drag offset. */
  swipeDirection: SwipeDirection | null;
  /** Whether the card is currently executing a snap-back or swipe-away animation. */
  isAnimating: boolean;
  /** Whether the user is actively dragging the card. */
  isDragging: boolean;
  /** An object containing the pointer event handlers to be spread onto the swipable element. */
  bind: {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
  };
  /** A function to programmatically trigger a swipe. */
  triggerSwipe: (direction: SwipeDirection) => void;
}

/**
 * A custom hook to manage the state and logic for a "Tinder-style" card swipe interface.
 * It handles pointer events, calculates drag offsets, and triggers callbacks on successful swipes.
 *
 * @param options - Configuration for the hook, including the onSwipe callback.
 * @returns An object with state and event handlers to apply to your component.
 */
export const useSwipeToReact = ({
  onSwipe,
}: UseSwipeToReactOptions): UseSwipeToReactReturn => {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // useRef is used to store values that persist across renders without causing them.
  const startRef = useRef({ x: 0, y: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to clean up any pending timers when the component unmounts.
  // This prevents memory leaks and React state update warnings.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  /**
   * Animates the card off the screen and triggers the onSwipe callback.
   * Can be called internally by the gesture handler or externally via `triggerSwipe`.
   */
  const snapOffAndReact = useCallback(
    (mode: SwipeDirection) => {
      // Calculate the final position of the card off-screen.
      const endX =
        mode === 'up'
          ? -window.innerWidth // Swipe left for 'up'
          : mode === 'down'
          ? window.innerWidth // Swipe right for 'down'
          : 0;
      const endY = mode === 'neutral' ? -window.innerHeight : dragOffset.y; // Swipe up for 'neutral'

      setIsAnimating(true);
      setDragOffset({ x: endX, y: endY });

      // After the animation, fire the callback and reset the state.
      timerRef.current = setTimeout(() => {
        onSwipe(mode);
        setIsAnimating(false);
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
      }, ANIMATION_DURATION);
    },
    [dragOffset.y, onSwipe]
  );

  /**
   * Animates the card back to its original position if a swipe gesture is abandoned.
   */
  const snapBack = useCallback(() => {
    setIsAnimating(true);
    setDragOffset({ x: 0, y: 0 });
    timerRef.current = setTimeout(
      () => setIsAnimating(false),
      ANIMATION_DURATION
    );
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      // Prevent starting a drag if the user is interacting with an element inside the card (e.g., a button).
      if ((e.target as HTMLElement).closest('button, a')) {
        return;
      }

      // Capture the pointer to ensure events are received even if the cursor leaves the element.
      e.currentTarget.setPointerCapture(e.pointerId);
      startRef.current = { x: e.clientX, y: e.clientY };
      setIsAnimating(false);
      setIsDragging(true);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;

      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      setDragOffset({ x: dx, y: dy });
    },
    []
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      e.currentTarget.releasePointerCapture(e.pointerId);

      const { x, y } = dragOffset;
      const absX = Math.abs(x);
      const absY = Math.abs(y);

      setIsDragging(false);

      // Determine if a swipe threshold was met and in which direction.
      if (absX > absY && absX > SWIPE_THRESHOLD) {
        // Horizontal swipe
        snapOffAndReact(x < 0 ? 'up' : 'down');
      } else if (absY > absX && -y > SWIPE_THRESHOLD) {
        // Vertical swipe (upwards)
        snapOffAndReact('neutral');
      } else {
        // Not a valid swipe, snap back to the center.
        snapBack();
      }
    },
    [dragOffset, snapBack, snapOffAndReact]
  );

  // Calculate the current swipe direction based on drag offset for immediate UI feedback.
  const { x, y } = dragOffset;
  const absX = Math.abs(x);
  const absY = Math.abs(y);
  let swipeDirection: SwipeDirection | null = null;

  if (absX > absY && absX > 50) {
    swipeDirection = x < 0 ? 'up' : 'down';
  } else if (absY > absX && y < -50) {
    swipeDirection = 'neutral';
  }

  return {
    dragOffset,
    swipeDirection,
    isAnimating,
    isDragging,
    bind: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
    triggerSwipe: snapOffAndReact,
  };
};
