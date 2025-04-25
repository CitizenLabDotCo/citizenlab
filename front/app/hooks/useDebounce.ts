import { useEffect, useMemo, useRef } from 'react';

import { debounce } from 'lodash-es';

type Callback = () => void;

const useDebounce = (callback: Callback, delay?: number) => {
  // ref can be callback or null
  const ref = useRef<Callback>();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.();
    };
    return debounce(func, delay || 300);
  }, [delay]);

  return debouncedCallback;
};

export default useDebounce;
