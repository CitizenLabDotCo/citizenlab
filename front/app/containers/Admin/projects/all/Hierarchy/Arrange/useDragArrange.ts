import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { ArrangePlace } from './arrangeTargets';
import { hasCrossed } from './hasCrossed';
import { ArrangeGroupContext } from './useArrangeGroup';

// What the pointer carries: which item, and the element the preview copies.
export type DraggedItem = { id: string; node: HTMLElement | null };

const GLIDE = { duration: 200, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' };

interface Params {
  id: string;
  place?: ArrangePlace;
  // Set when this item can be moved.
  arrangeTo?: (ordering: number) => Promise<boolean>;
}

// Dragging an item by its handle within its group. As it passes over the
// others, it takes their place and they make room; dropping it saves where it
// shows. Every item of an arrangeable group makes room, even one this user
// can't move itself.
const useDragArrange = ({ id, place, arrangeTo }: Params) => {
  const group = useContext(ArrangeGroupContext);
  const node = useRef<HTMLElement | null>(null);
  const type = `arrange-${group?.kind}`;
  const draggable = !!(group && place && arrangeTo);

  const [{ dragging }, handle, preview] = useDrag(
    () => ({
      type,
      item: (): DraggedItem => ({ id, node: node.current }),
      canDrag: () => draggable,
      end: (_item, monitor) => {
        if (group && arrangeTo) group.finish(id, monitor.didDrop(), arrangeTo);
      },
      collect: (monitor) => ({ dragging: monitor.isDragging() }),
    }),
    [type, id, draggable, group, arrangeTo]
  );

  const [, drop] = useDrop(
    () => ({
      accept: type,
      canDrop: () => !!place,
      hover: (dragged: DraggedItem, monitor) => {
        const element = node.current;
        const pointer = monitor.getClientOffset();
        if (!place || !group || !element || !pointer || !dragged.node) return;
        if (dragged.id === id) return;
        // Still gliding to a new place: what's under the pointer is moving.
        if (
          typeof element.getAnimations === 'function' &&
          element.getAnimations().length > 0
        ) {
          return;
        }

        const crossed = hasCrossed({
          over: element.getBoundingClientRect(),
          dragged: dragged.node.getBoundingClientRect(),
          pointer,
          forward: group.orderOf(dragged.id) < group.orderOf(id),
        });
        if (crossed) group.hover(dragged.id, id);
      },
    }),
    [type, id, place, group]
  );

  // The browser's own picture of the item is replaced by the preview layer.
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const item = useCallback(
    (element: HTMLElement | null) => {
      node.current = element;
      drop(element);
    },
    [drop]
  );

  // While the group makes room, and as it settles back when a drag is let go
  // elsewhere, items glide from where they were to where they now show,
  // instead of jumping.
  const position = useRef<{ left: number; top: number } | null>(null);
  const wasRearranging = useRef(false);
  const rearranging = !!group?.rearranging;
  useLayoutEffect(() => {
    const element = node.current;
    if (!element) return;
    const now = { left: element.offsetLeft, top: element.offsetTop };
    const before = position.current;
    const glide = rearranging || wasRearranging.current;
    position.current = now;
    wasRearranging.current = rearranging;
    if (!glide || !before || typeof element.animate !== 'function') return;

    const dx = before.left - now.left;
    const dy = before.top - now.top;
    if (dx || dy) {
      element.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        GLIDE
      );
    }
  });

  return {
    item,
    // Set when this item can be dragged.
    handle: draggable ? handle : undefined,
    dragging,
  };
};

export type DragArrange = ReturnType<typeof useDragArrange>;

export default useDragArrange;
