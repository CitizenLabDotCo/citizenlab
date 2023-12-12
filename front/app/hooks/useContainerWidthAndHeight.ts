import { useState, useCallback } from 'react';

const useContainerWidthAndHeight = () => {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState(0);

  const containerRef = useCallback((node) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
      setWidth(node.getBoundingClientRect().width);
    }
  }, []);

  return { width, height, containerRef };
};

export default useContainerWidthAndHeight;
