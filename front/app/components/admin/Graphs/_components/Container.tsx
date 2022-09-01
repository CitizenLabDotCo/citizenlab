import React, { useState, useCallback } from 'react';
import { useResizeDetector } from 'react-resize-detector';

// components
import { ResponsiveContainer } from 'recharts';

// utils
import { debounce, isEqual } from 'lodash-es';

// typings
import { Percentage } from 'typings';
import { GraphDimensions } from '../_components/Legend/typings';

interface Props {
  width?: number | Percentage;
  height?: number | Percentage;
  onUpdateGraphDimensions: (graphDimensions: GraphDimensions) => void;
  children: React.ReactElement;
}

const Container = ({
  width,
  height,
  onUpdateGraphDimensions,
  children,
}: Props) => {
  const [graphDimensions, setGraphDimensions] = useState<
    GraphDimensions | undefined
  >();

  /* eslint-disable */
  const onResize = useCallback(
    debounce((width: number, height: number) => {
      const newGraphDimensions = { width, height };

      if (!isEqual(graphDimensions, newGraphDimensions)) {
        setGraphDimensions(newGraphDimensions);
        onUpdateGraphDimensions(newGraphDimensions);
      }
    }, 50),
    []
  );
  /* eslint-enable */

  const { ref: resizeRef } = useResizeDetector({ onResize });

  const handleRef = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref === null) return;
    const node = ref.current;
    if (node === null) return;

    resizeRef.current = node;
  };

  return (
    <ResponsiveContainer width={width} height={height} ref={handleRef}>
      {children}
    </ResponsiveContainer>
  );
};

export default Container;
