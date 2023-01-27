import React, { useState } from 'react';

// styling
import { legacyColors, sizes, colors } from 'components/admin/Graphs/styling';

// components
import {
  ComposedChart,
  CartesianGrid,
  Line,
  Label,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts';
import Container from '../_components/Container';
import EmptyState from '../_components/EmptyState';
import Legend from '../_components/Legend';
import { Legend as ILegend } from 'components/admin/Graphs/typings';

// utils
import { hasNoData, parseMargin } from '../utils';
import { toFullMonth } from 'utils/dateUtils';

// typings
import { Props } from './typings';
import {
  GraphDimensions,
  LegendDimensions,
} from '../_components/Legend/typings';

// hooks
import { useIntl } from 'utils/cl-intl';

// i18n
import messages from 'containers/Admin/dashboard/messages';

export const DEFAULT_LEGEND_OFFSET = 10;

const LineBarChart = <Row,>({
  width,
  height,
  data,
  mapping,
  resolution,
  margin,
  xaxis,
  yaxis,
  legend,
  emptyContainerContent,
  innerRef,
}: Props<Row>) => {
  const [graphDimensions, setGraphDimensions] = useState<
    GraphDimensions | undefined
  >();
  const [legendDimensions, setLegendDimensions] = useState<
    LegendDimensions | undefined
  >();
  const { formatMessage } = useIntl();
  if (hasNoData(data)) {
    return <EmptyState emptyContainerContent={emptyContainerContent} />;
  }

  const x = mapping.x;
  const y = mapping.y;
  if (typeof x === 'symbol' || y.some((y_) => typeof y_ === 'symbol'))
    return null;

  const resolution_ = (resolution || 'month') as string;

  const formatLabel = (date: string) => {
    return resolution ? toFullMonth(date, resolution) : date;
  };

  const defaultLegend = {
    marginTop: 16,
    items: [
      {
        icon: 'line',
        color: legacyColors.line,
        label: formatMessage(messages.total),
      },
      {
        icon: 'rect',
        color: colors.categorical01,
        label: formatMessage(messages.totalForPeriod, { period: resolution_ }),
      },
    ],
  } as ILegend;

  legend = legend || defaultLegend;

  return (
    <Container
      width={width}
      height={height}
      legend={legend}
      graphDimensions={graphDimensions}
      legendDimensions={legendDimensions}
      defaultLegendOffset={DEFAULT_LEGEND_OFFSET}
      onUpdateGraphDimensions={setGraphDimensions}
      onUpdateLegendDimensions={setLegendDimensions}
    >
      <ComposedChart
        data={data}
        reverseStackOrder={true}
        ref={innerRef}
        margin={parseMargin(
          margin,
          legend,
          legendDimensions,
          DEFAULT_LEGEND_OFFSET
        )}
      >
        <CartesianGrid stroke={legacyColors.cartesianGrid} strokeWidth={0.5} />
        <XAxis
          dataKey={x}
          type="category"
          stroke={legacyColors.chartLabel}
          fontSize={sizes.chartLabel}
          tick={{ transform: 'translate(0, 7)' }}
          {...xaxis}
        />
        <YAxis
          yAxisId="total"
          stroke={legacyColors.chartLabel}
          fontSize={sizes.chartLabel}
          tickLine={false}
        >
          <Label
            value={formatMessage(messages.total)}
            angle={-90}
            position={'center'}
            dx={-15}
          />
        </YAxis>
        <YAxis
          yAxisId="barValue"
          orientation="right"
          allowDecimals={false}
          tickLine={false}
          {...yaxis}
        >
          <Label
            value={formatMessage(messages.perPeriod, {
              period: formatMessage(messages[resolution_]),
            })}
            angle={90}
            position={'center'}
            dx={15}
          />
        </YAxis>
        <Tooltip
          isAnimationActive={false}
          labelFormatter={formatLabel}
          cursor={{ strokeWidth: 1 }}
        />
        {legend?.items
          .filter((l) => l.icon !== 'line')
          .map((legend, legend_i) => (
            <Bar
              key={legend_i}
              dataKey={y[legend_i] as string}
              yAxisId="barValue"
              stackId="1"
              barSize={sizes.bar}
              fill={legend.color}
              fillOpacity={1}
              name={legend.label}
            />
          ))}
        <Line
          type="monotone"
          yAxisId="total"
          dataKey="total"
          activeDot={Boolean(data && data?.length < 31)}
          stroke={legacyColors.line}
          fill={legacyColors.line}
          strokeWidth={1}
          name={formatMessage(messages.total)}
        />
        {legend && graphDimensions && legendDimensions && (
          <g className="graph-legend">
            <Legend
              items={legend.items}
              graphDimensions={graphDimensions}
              legendDimensions={legendDimensions}
              position={legend.position}
              textColor={legend.textColor}
              margin={margin}
            />
          </g>
        )}
      </ComposedChart>
    </Container>
  );
};

export default LineBarChart;
