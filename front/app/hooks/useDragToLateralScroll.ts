import { useState, useEffect, useRef } from 'react';

// This hook allows a user to click and drag horizontally with a mouse to scroll a container
export const useDragToLateralScroll = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState({
    clickLocation: 0,
    scrollLeft: 0,
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);
    setDragState({
      clickLocation: e.pageX - scrollContainerRef.current.offsetLeft, // Where the user clicked when starting to drag
      scrollLeft: scrollContainerRef.current.scrollLeft, // How far the table has already been scrolled horizontally
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!scrollContainerRef.current) return;

      event.preventDefault();

      // Calculate the new scroll position based on mouse movement
      const mouseX = event.pageX - scrollContainerRef.current.offsetLeft; // Current mouse position relative to the container
      const moveDistance = (mouseX - dragState.clickLocation) * 2; // Multiply by 2 for faster scrolling
      scrollContainerRef.current.scrollLeft =
        dragState.scrollLeft - moveDistance;
    };

    const handleMouseUp = () => setIsDragging(false);

    // Prevent text selection of the table content during drag
    const preventSelection = (event: Event) => event.preventDefault();

    // Attach the event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectstart', preventSelection);

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectstart', preventSelection);
    };
  }, [isDragging, dragState]);

  return {
    scrollContainerRef,
    handleMouseDown,
  };
};
