export const arrangeMoves = ['start', 'earlier', 'later', 'end'] as const;

export type ArrangeMove = (typeof arrangeMoves)[number];

// An item's place in its group, as shown: the order of every item loaded so
// far, and whether more are still to load.
export type ArrangePlace = {
  orderings: number[];
  index: number;
  hasMore: boolean;
};

// Where each move takes an item, as the `ordering` to send: moving an item
// onto another's ordering puts it where that one was, and shifts the ones in
// between. Moves that would change nothing are left out, and so are those
// past the last item loaded, as the items after it aren't known yet.
export const getArrangeTargets = ({
  orderings,
  index,
  hasMore,
}: ArrangePlace): Partial<Record<ArrangeMove, number>> => {
  const last = orderings.length - 1;
  const targets: Partial<Record<ArrangeMove, number>> = {};

  if (index > 0) {
    targets.start = orderings[0];
    targets.earlier = orderings[index - 1];
  }
  if (index < last) {
    targets.later = orderings[index + 1];
    if (!hasMore) targets.end = orderings[last];
  }

  return targets;
};

// Each item's place in a group, from the items loaded so far.
export const placesIn = (
  items: { attributes: { ordering: number } }[],
  hasMore: boolean
) => {
  const orderings = items.map((item) => item.attributes.ordering);
  return (index: number): ArrangePlace => ({ orderings, index, hasMore });
};
