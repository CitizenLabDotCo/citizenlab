import React, { useCallback } from 'react';
import { useResizeDetector } from 'react-resize-detector';

// components
import { ResponsiveContainer } from 'recharts';
import FakeLegend from './Legend/FakeLegend';
import { Box } from '@citizenlab/cl2-component-library';

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
  graphDimensions: GraphDimensions | undefined;
  legendDimensions: LegendDimensions | undefined;
  onUpdateGraphDimensions?: (graphDimensions: GraphDimensions) => void;
  onUpdateLegendDimensions?: (legendDimensions: LegendDimensions) => void;
  children: React.ReactElement;
}

const Container = ({
  width,
  height,
  legend,
  graphDimensions,
  legendDimensions,
  onUpdateGraphDimensions,
  onUpdateLegendDimensions,
  children,
}: Props) => {
  /* eslint-disable */
  const handleResize = useCallback(
    debounce((width: number, height: number) => {
      const newGraphDimensions = { width, height };

      if (!isEqual(graphDimensions, newGraphDimensions)) {
        if (onUpdateGraphDimensions) {
          onUpdateGraphDimensions(newGraphDimensions);
        }
      }
    }, 50),
    []
  );
  /* eslint-enable */

  const { ref: resizeRef } = useResizeDetector({ onResize: handleResize });

  const handleRef = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref === null) return;
    const node = ref.current;
    if (node === null) return;

    resizeRef.current = node;
  };

  const rightLegend = legend?.position?.includes('right');

  const parsedWidth = !rightLegend
    ? width
    : typeof width === 'number' && legend?.maintainGraphSize
    ? width + (legendDimensions?.width ?? 0)
    : width;

  const parsedHeight = rightLegend
    ? height
    : typeof height === 'number' && legend?.maintainGraphSize
    ? height + (legendDimensions?.height ?? 0)
    : height;

  return (
    <Box display="flex" flexDirection={rightLegend ? 'row' : 'column'}>
      <ResponsiveContainer
        width={parsedWidth}
        height={parsedHeight}
        ref={handleRef}
      >
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
    </Box>
  );
};

export default Container;
