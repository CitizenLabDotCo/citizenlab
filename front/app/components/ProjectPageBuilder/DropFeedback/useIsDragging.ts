import { useEffect, useState } from 'react';

// craft.js only fills `state.events.dragged` when an existing node is moved: a
// widget pulled out of the toolbox goes through the `create` connector and
// stays out of the editor state until it is dropped. Both cases start a native
// HTML5 drag on an element craft marked draggable, so the drag lifecycle is
// read from the DOM instead.
const useIsDragging = () => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const startDrag = (event: DragEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (!target?.closest('[draggable="true"]')) return;

      setIsDragging(true);
    };
    const endDrag = () => setIsDragging(false);

    document.addEventListener('dragstart', startDrag);
    document.addEventListener('dragend', endDrag);
    document.addEventListener('drop', endDrag);

    return () => {
      document.removeEventListener('dragstart', startDrag);
      document.removeEventListener('dragend', endDrag);
      document.removeEventListener('drop', endDrag);
    };
  }, []);

  return isDragging;
};

export default useIsDragging;
