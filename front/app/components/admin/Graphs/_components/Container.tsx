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
  defaultLegendOffset: number;
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
  defaultLegendOffset,
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
  const maintainGraphSize = !!legend?.maintainGraphSize;

  const getWidth = () => {
    if (width === undefined) return '100%';
    if (typeof width === 'string') return width;

    if (rightLegend && maintainGraphSize) {
      const adjustedWidth =
        width +
        (legendDimensions?.width ?? 0) +
        (legend.marginLeft ?? defaultLegendOffset);

      return `${adjustedWidth}px`;
    }

    return `${width}px`;
  };

  const getHeight = () => {
    if (height === undefined) return '100%';
    if (typeof height === 'string') return height;

    if (!rightLegend && maintainGraphSize) {
      const adjustedHeight =
        height +
        (legendDimensions?.height ?? 0) +
        (legend.marginTop ?? defaultLegendOffset);

      return `${adjustedHeight}px`;
    }

    return `${height}px`;
  };

  return (
    <Box
      display="flex"
      flexDirection={rightLegend ? 'row' : 'column'}
      justifyContent="center"
      width="100%"
      height="100%"
    >
      <Box width={getWidth()} height={getHeight()}>
        <ResponsiveContainer width="100%" height="100%" ref={handleRef}>
          {children}
        </ResponsiveContainer>
      </Box>

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
