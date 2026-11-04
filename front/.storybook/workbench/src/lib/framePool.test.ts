import { createFramePool } from './framePool';

describe('framePool', () => {
  it('boots at most two at once and grants the next when one has rendered', () => {
    const pool = createFramePool(2, 8);
    const granted: number[] = [];
    const releases = [0, 1, 2, 3].map((i) =>
      pool.request(() => granted.push(i))
    );
    expect(granted).toEqual([0, 1]);
    pool.booted(releases[0]);
    expect(granted).toEqual([0, 1, 2]);
    expect(pool.stats()).toEqual({ booting: 2, alive: 3, waiting: 1 });
  });

  it('keeps at most the alive cap, freeing a slot when a card scrolls away', () => {
    const pool = createFramePool(8, 2);
    const granted: number[] = [];
    const releases = [0, 1, 2].map((i) => pool.request(() => granted.push(i)));
    releases.slice(0, 2).forEach((r) => pool.booted(r));
    expect(granted).toEqual([0, 1]);
    releases[0]();
    expect(granted).toEqual([0, 1, 2]);
    expect(pool.stats()).toEqual({ booting: 1, alive: 2, waiting: 0 });
  });

  it('drops a waiting card that leaves before its turn', () => {
    const pool = createFramePool(1, 8);
    const granted: number[] = [];
    const first = pool.request(() => granted.push(0));
    const second = pool.request(() => granted.push(1));
    second();
    first();
    expect(granted).toEqual([0]);
    expect(pool.stats()).toEqual({ booting: 0, alive: 0, waiting: 0 });
  });

  it('ignores a second release or booted call', () => {
    const pool = createFramePool(2, 8);
    const release = pool.request(() => undefined);
    pool.booted(release);
    pool.booted(release);
    release();
    release();
    expect(pool.stats()).toEqual({ booting: 0, alive: 0, waiting: 0 });
  });
});
