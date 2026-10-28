// Live preview frames in cards each boot a whole Storybook preview, on the
// workbench's own main thread. The pool lets only a few boot at once and
// keeps only a few alive, so a gallery without pictures (another city, a
// missing thumbs.json) cannot pile up dozens of previews and freeze the
// browser. Cards ask for a slot when near the screen, give it back when
// they scroll away or unmount; the rest wait their turn, first come first.
// Pure: no React, tested in framePool.test.ts.

export const MAX_BOOTING = 2;
export const MAX_ALIVE = 8;

export type FramePool = {
  // Asks for a slot; `grant` runs once one is free. Returns a release that
  // gives the slot back (or leaves the queue).
  request: (grant: () => void) => () => void;
  // The frame has rendered (or given up): it stops counting as booting.
  booted: (release: () => void) => void;
  stats: () => { booting: number; alive: number; waiting: number };
};

export const createFramePool = (
  maxBooting = MAX_BOOTING,
  maxAlive = MAX_ALIVE
): FramePool => {
  type Slot = { grant: () => void; granted: boolean; booting: boolean };
  const slots = new Map<() => void, Slot>();
  const queue: Slot[] = [];
  let booting = 0;
  let alive = 0;

  const pump = () => {
    while (queue.length > 0 && booting < maxBooting && alive < maxAlive) {
      const slot = queue.shift() as Slot;
      slot.granted = true;
      slot.booting = true;
      booting += 1;
      alive += 1;
      slot.grant();
    }
  };

  const request = (grant: () => void) => {
    const slot: Slot = { grant, granted: false, booting: false };
    const release = () => {
      if (!slots.delete(release)) return;
      if (slot.granted) {
        alive -= 1;
        if (slot.booting) booting -= 1;
      } else {
        const i = queue.indexOf(slot);
        if (i >= 0) queue.splice(i, 1);
      }
      pump();
    };
    slots.set(release, slot);
    queue.push(slot);
    pump();
    return release;
  };

  const booted = (release: () => void) => {
    const slot = slots.get(release);
    if (!slot || !slot.booting) return;
    slot.booting = false;
    booting -= 1;
    pump();
  };

  return {
    request,
    booted,
    stats: () => ({ booting, alive, waiting: queue.length }),
  };
};

// The one pool every card shares.
export const framePool = createFramePool();
