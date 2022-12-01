import React, { useMemo } from 'react';
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

const warn = console.warn.bind(console);
function wrapWarn(...args) {
  if (args[0].includes('ResponsiveContainer')) return;
  warn(...args);
}

console.warn = wrapWarn;

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
  const handleResize = useMemo(
    () =>
      debounce((width: number, height: number) => {
        const newGraphDimensions = { width, height };

        if (!isEqual(graphDimensions, newGraphDimensions)) {
          if (onUpdateGraphDimensions) {
            onUpdateGraphDimensions(newGraphDimensions);
          }
        }
      }, 50),
    [graphDimensions, onUpdateGraphDimensions]
  );

  const { ref: resizeRef } = useResizeDetector({ onResize: handleResize });

  const handleRef = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref === null) return;
    const node = ref.current;
    if (node === null) return;

    resizeRef.current = node;
  };

  const rightLegend = legend?.position?.includes('right');
  const maintainGraphSize = !!legend?.maintainGraphSize;

  const parsedWidth =
    rightLegend && typeof width === 'number' && maintainGraphSize
      ? width +
        (legendDimensions?.width ?? 0) +
        (legend.marginLeft ?? defaultLegendOffset)
      : width;

  const parsedHeight =
    !rightLegend && typeof height === 'number' && maintainGraphSize
      ? height +
        (legendDimensions?.height ?? 0) +
        (legend.marginTop ?? defaultLegendOffset)
      : height;

  return (
    <Box
      display="flex"
      flexDirection={rightLegend ? 'row' : 'column'}
      justifyContent="center"
      width="100%"
      height="100%"
    >
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
