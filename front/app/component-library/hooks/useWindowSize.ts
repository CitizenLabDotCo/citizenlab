import { useEffect, useState } from 'react';

import { debounce } from 'lodash-es';

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });
    const debouncedHandleResize = debounce(handleResize, 500);
    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, []);

  return windowSize;
}

export default useWindowSize;
