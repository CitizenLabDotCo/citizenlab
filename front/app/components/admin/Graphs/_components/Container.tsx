import React, { useEffect, useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { isEqual } from 'lodash-es';
import { ResponsiveContainer } from 'recharts';
import { Percentage } from 'typings';

import {
  GraphDimensions,
  LegendDimensions,
} from '../_components/Legend/typings';
import { Legend } from '../typings';

import FakeLegend from './Legend/FakeLegend';

interface Props {
  width?: number | Percentage;
  height?: number | Percentage;
  legend?: Legend;
  legendDimensions: LegendDimensions | undefined;
  defaultLegendOffset: number;
  onUpdateGraphDimensions?: (graphDimensions: GraphDimensions) => void;
  onUpdateLegendDimensions?: (legendDimensions: LegendDimensions) => void;
  children: React.ReactElement;
}

const warn = console.warn.bind(console);
function wrapWarn(...args) {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('ResponsiveContainer') ||
      args[0].includes('minWidth(undefined) or minHeight(undefined) '))
  ) {
    return;
  }
  warn(...args);
}

console.warn = wrapWarn;

const Container = ({
  width,
  height,
  legend,
  legendDimensions,
  defaultLegendOffset,
  onUpdateGraphDimensions,
  onUpdateLegendDimensions,
  children,
}: Props) => {
  const prevDimensionsRef = useRef<GraphDimensions | undefined>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onUpdateGraphDimensionsRef = useRef(onUpdateGraphDimensions);

  useEffect(() => {
    onUpdateGraphDimensionsRef.current = onUpdateGraphDimensions;
  }, [onUpdateGraphDimensions]);

  // In recharts 3.x, ResponsiveContainer's onResize callback is no longer
  // reliably called on initial mount. We use our own ResizeObserver to detect
  // container dimensions for positioning the legend.
  useEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) return;

      const newDimensions = { width, height };
      if (isEqual(prevDimensionsRef.current, newDimensions)) return;

      prevDimensionsRef.current = newDimensions;
      onUpdateGraphDimensionsRef.current?.(newDimensions);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
      <Box
        ref={containerRef}
        width={
          typeof parsedWidth === 'number' ? `${parsedWidth}px` : parsedWidth
        }
        height={
          typeof parsedHeight === 'number' ? `${parsedHeight}px` : parsedHeight
        }
      >
        <ResponsiveContainer width="100%" height="100%">
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
