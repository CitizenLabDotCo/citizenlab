import { useEffect, useRef, useState } from 'react';

import { useIsFetching } from '@tanstack/react-query';

interface Options {
  // How long everything must stay quiet before the report counts as settled.
  // Charts load in waves: a block's module arrives, then it asks for its data,
  // so a single moment of quiet is not the end.
  quietMs?: number;
  // Give up waiting and lay out whatever is there. A report that never settles
  // must still produce a printable document.
  maxMs?: number;
}

// True once the report has stopped loading: every query has finished and nothing
// new has started for a while.
//
// This replaces waiting a fixed number of seconds, which was a race — on a slow
// day it printed half-drawn charts.
const useReportSettled = ({ quietMs = 900, maxMs = 30_000 }: Options = {}) => {
  const isFetching = useIsFetching();
  const [settled, setSettled] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (settled) return;

    if (Date.now() - startedAt.current > maxMs) {
      setSettled(true);
      return;
    }

    if (isFetching > 0) return;

    const timer = setTimeout(() => setSettled(true), quietMs);
    return () => clearTimeout(timer);
  }, [isFetching, settled, quietMs, maxMs]);

  // While queries keep starting and stopping the effect re-runs and the timer
  // restarts, so a busy report simply waits longer.
  useEffect(() => {
    if (settled) return;

    const deadline = setTimeout(
      () => setSettled(true),
      Math.max(0, maxMs - (Date.now() - startedAt.current))
    );
    return () => clearTimeout(deadline);
  }, [settled, maxMs]);

  return settled;
};

export default useReportSettled;
