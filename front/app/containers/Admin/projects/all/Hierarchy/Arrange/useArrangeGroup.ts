import { createContext, useState } from 'react';

import { ArrangePlace, placesIn } from './arrangeTargets';

type Arrangeable = { id: string; attributes: { ordering: number } };

export type ArrangeKind = 'space' | 'folder' | 'project';

// What the items of a group share while one of them is dragged.
export type ArrangeGroup = {
  // Items only move among their own kind, which is one group of a level.
  kind: ArrangeKind;
  // True while the group shows a dragged item somewhere new.
  rearranging: boolean;
  // Where an item shows now, among the group's.
  orderOf: (id: string) => number;
  // The dragged item takes the place of the one it's over.
  hover: (draggedId: string, overId: string) => void;
  // A drop saves the place it was shown in; anything else puts it back.
  finish: (
    draggedId: string,
    dropped: boolean,
    arrangeTo: (ordering: number) => Promise<boolean>
  ) => void;
};

export const ArrangeGroupContext = createContext<ArrangeGroup | null>(null);

// The dragged item, moved to just before or after the one it's over.
const moveId = (ids: string[], draggedId: string, overId: string) => {
  const to = ids.indexOf(overId);
  if (to === -1 || ids.indexOf(draggedId) === to) return ids;
  const rest = ids.filter((id) => id !== draggedId);
  return [...rest.slice(0, to), draggedId, ...rest.slice(to)];
};

// A group's items in the order to show them. While an item is dragged, it
// shows where it would land and the others make room, as in the prototype; a
// drop sends it to the ordering of the item that was in that place. The
// shown order stays until the saved one comes back, so the items don't jump
// back while the change saves.
const useArrangeGroup = <T extends Arrangeable>({
  kind,
  items,
  hasMore,
  arrangeable,
}: {
  kind: ArrangeKind;
  items: T[];
  hasMore: boolean;
  arrangeable: boolean;
}) => {
  const ids = items.map((item) => item.id);
  const [draft, setDraft] = useState<string[] | null>(null);

  // A new order from the server replaces the one shown.
  const idsKey = ids.join();
  const [shownFor, setShownFor] = useState(idsKey);
  if (shownFor !== idsKey) {
    setShownFor(idsKey);
    setDraft(null);
  }

  const byId = new Map(items.map((item) => [item.id, item]));
  const shown = (draft ?? ids).flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });

  const orderings = items.map((item) => item.attributes.ordering);
  const placeAt = arrangeable ? placesIn(items, hasMore) : undefined;
  const placeOf = (item: T): ArrangePlace | undefined =>
    placeAt?.(ids.indexOf(item.id));

  const group: ArrangeGroup = {
    kind,
    rearranging: draft !== null,
    orderOf: (id) => (draft ?? ids).indexOf(id),
    hover: (draggedId, overId) => {
      setDraft((current) => {
        const shownIds = current ?? ids;
        const next = moveId(shownIds, draggedId, overId);
        return next === shownIds ? current : next;
      });
    },
    // Called by the dragged item with the group of the last render, so with
    // the order it shows.
    finish: async (draggedId, dropped, arrangeTo) => {
      const to = (draft ?? ids).indexOf(draggedId);
      if (!dropped || to === ids.indexOf(draggedId)) {
        setDraft(null);
        return;
      }
      const saved = await arrangeTo(orderings[to]);
      if (!saved) setDraft(null);
    },
  };

  return { shown, placeOf, group };
};

export default useArrangeGroup;
