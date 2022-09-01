import React, { useState, useCallback } from 'react';
import { useResizeDetector } from 'react-resize-detector';

// components
import { ResponsiveContainer } from 'recharts';
import FakeLegend from './Legend/FakeLegend';

// utils
import { debounce, isEqual } from 'lodash-es';

// typings
import { Percentage } from 'typings';
import {
  GraphDimensions,
  LegendDimensions,
} from '../_components/Legend/typings';
import { Legend } from '../typings';

interface Props {
  width?: number | Percentage;
  height?: number | Percentage;
  legend?: Legend;
  onUpdateGraphDimensions?: (graphDimensions: GraphDimensions) => void;
  onUpdateLegendDimensions?: (legendDimensions: LegendDimensions) => void;
  children: React.ReactElement;
}

const Container = ({
  width,
  height,
  legend,
  onUpdateGraphDimensions,
  onUpdateLegendDimensions,
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

        if (onUpdateGraphDimensions) {
          onUpdateGraphDimensions(newGraphDimensions);
        }
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
    <>
      <ResponsiveContainer width={width} height={height} ref={handleRef}>
        {children}
      </ResponsiveContainer>

      {legend && onUpdateLegendDimensions && (
        <FakeLegend
          width={width}
          items={legend.items}
          position={legend.position}
          onCalculateDimensions={onUpdateLegendDimensions}
        />
      )}
    </>
  );
};

export default Container;
