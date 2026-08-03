import { useEffect, useRef } from 'react';

/**
 * Calls `onTimeout` once `active` has been continuously true for `delay` ms.
 *
 * The timer starts when `active` flips to true and is cancelled as soon as it
 * flips back to false (or the component unmounts), so it only fires for states
 * that never resolve on their own. `onTimeout` does not need to be memoized:
 * it is read from a ref, so re-creating it on every render will not restart the
 * timer.
 *
 * Pass `restartKey` when `active` covers several steps that each deserve the
 * full delay: changing it restarts the timer without interrupting the active
 * state, so a slow first step cannot eat into the budget of the next one.
 */
const useTimeoutWhen = (
  active: boolean,
  delay: number,
  onTimeout: () => void,
  restartKey?: unknown
) => {
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  useEffect(() => {
    if (!active) return;

    const timer = setTimeout(() => onTimeoutRef.current(), delay);
    return () => clearTimeout(timer);
  }, [active, delay, restartKey]);
};

export default useTimeoutWhen;
