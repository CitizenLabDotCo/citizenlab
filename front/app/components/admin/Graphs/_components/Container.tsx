import React, { useEffect } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useResizeDetector } from 'react-resize-detector';
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
  const rightLegend = legend?.position?.includes('right');
  const maintainGraphSize = !!legend?.maintainGraphSize;

  // Measure actual dimensions when percentages are used
  const {
    width: measuredWidth,
    height: measuredHeight,
    ref,
  } = useResizeDetector();

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

  useEffect(() => {
    // Use measured dimensions when props are percentages
    const finalWidth =
      typeof parsedWidth === 'number' ? parsedWidth : measuredWidth;
    const finalHeight =
      typeof parsedHeight === 'number' ? parsedHeight : measuredHeight;

    if (finalWidth && finalHeight) {
      onUpdateGraphDimensions?.({ width: finalWidth, height: finalHeight });
    }
  }, [
    parsedWidth,
    parsedHeight,
    measuredWidth,
    measuredHeight,
    onUpdateGraphDimensions,
  ]);

  return (
    <Box
      display="flex"
      flexDirection={rightLegend ? 'row' : 'column'}
      justifyContent="center"
      width="100%"
      height="100%"
    >
      <Box
        ref={ref}
        width={
          typeof parsedWidth === 'number'
            ? `${parsedWidth}px`
            : parsedWidth ?? '100%'
        }
        height={
          typeof parsedHeight === 'number'
            ? `${parsedHeight}px`
            : parsedHeight ?? '100%'
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
