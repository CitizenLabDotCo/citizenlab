import { useRef } from 'react';

// Returns an object whose identity changes only when one of the deps changes.
// Used as the error-boundary resetKey: a plain useMemo with unused deps trips
// react-hooks/exhaustive-deps, and children identity is deliberately not a
// signal (see BlockErrorBoundary).
const useResetKey = (deps: unknown[]): object => {
  const ref = useRef<{ identity: object; deps: unknown[] } | null>(null);

  if (
    !ref.current ||
    ref.current.deps.length !== deps.length ||
    deps.some((dep, index) => dep !== ref.current?.deps[index])
  ) {
    ref.current = { identity: {}, deps };
  }

  return ref.current.identity;
};

export default useResetKey;
