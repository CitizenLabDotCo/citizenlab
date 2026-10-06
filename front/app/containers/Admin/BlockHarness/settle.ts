import { QueryClient } from '@tanstack/react-query';

/** Nothing that renders a report should take this long; past it, report what there is. */
const SETTLE_TIMEOUT_MS = 20_000;
const POLL_MS = 50;

/**
 * Idle has to hold this many polls in a row before the page counts as settled.
 *
 * One reading of "nothing is fetching" is not enough: the first one happens before
 * the block has mounted and asked for anything, so a single check would measure an
 * empty frame and report the chart as broken.
 */
const IDLE_POLLS_REQUIRED = 3;

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Waits until the page has stopped changing: every query done and staying done,
 * then two animation frames so the chart library has laid itself out.
 *
 * A fixed sleep would either make every check slow or measure a chart mid-draw.
 * The queries are the real signal — a block's data arrives through them — and the
 * frames cover the layout pass that follows.
 */
const settle = async (queryClient: QueryClient): Promise<void> => {
  const deadline = Date.now() + SETTLE_TIMEOUT_MS;

  // Let the mount effects run, so anything the block asks for is in flight before
  // the first reading.
  await nextFrame();
  await nextFrame();

  let idlePolls = 0;
  while (Date.now() < deadline && idlePolls < IDLE_POLLS_REQUIRED) {
    idlePolls = queryClient.isFetching() === 0 ? idlePolls + 1 : 0;
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }

  await nextFrame();
  await nextFrame();
};

export default settle;
