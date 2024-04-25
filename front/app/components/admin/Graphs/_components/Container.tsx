import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { debounce, isEqual } from 'lodash-es';
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
  graphDimensions: GraphDimensions | undefined;
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
        onResize={handleResize}
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
