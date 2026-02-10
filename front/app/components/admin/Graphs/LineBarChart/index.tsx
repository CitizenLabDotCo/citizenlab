import React, { useState } from 'react';

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

import dashboardMessages from 'containers/Admin/dashboard/messages';

import { legacyColors, sizes, colors } from 'components/admin/Graphs/styling';
import { Legend as ILegend } from 'components/admin/Graphs/typings';
import { IResolution } from 'components/admin/ResolutionControl';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { toFullMonth } from 'utils/dateUtils';

import Container from '../_components/Container';
import EmptyState from '../_components/EmptyState';
import Legend from '../_components/Legend';
import {
  GraphDimensions,
  LegendDimensions,
} from '../_components/Legend/typings';
import { hasNoData, parseMargin } from '../utils';

import { Props } from './typings';

export const DEFAULT_LEGEND_OFFSET = 10;

const PERIOD_MESSAGES: Record<IResolution, MessageDescriptor> = {
  month: dashboardMessages.month,
  week: dashboardMessages.week,
  day: dashboardMessages.day,
};

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

  const { x, yBars, yLine } = mapping;

  if (
    typeof x === 'symbol' ||
    yBars.some((yBar) => typeof yBar === 'symbol') ||
    typeof yLine === 'symbol'
  ) {
    return null;
  }

  const resolution_: IResolution = resolution ?? 'month';

  const formatLabel = (date: string) => {
    return resolution ? toFullMonth(date, resolution) : date;
  };

  const defaultLegend: ILegend = {
    marginTop: 16,
    items: [
      {
        icon: 'line',
        color: legacyColors.line,
        label: formatMessage(dashboardMessages.total),
      },
      {
        icon: 'rect',
        color: colors.categorical01,
        label: formatMessage(dashboardMessages.totalForPeriod, {
          period: formatMessage(PERIOD_MESSAGES[resolution_]),
        }),
      },
    ],
  };

  const legend_ = legend || defaultLegend;

  return (
    <Container
      width={width}
      height={height}
      legend={legend_}
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
          legend_,
          legendDimensions,
          DEFAULT_LEGEND_OFFSET
        )}
        accessibilityLayer
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
          yAxisId="line"
          stroke={legacyColors.chartLabel}
          fontSize={sizes.chartLabel}
          tickLine={false}
        >
          <Label
            value={formatMessage(dashboardMessages.total)}
            angle={-90}
            position={'center'}
            dx={-15}
          />
        </YAxis>
        <YAxis
          yAxisId="bar"
          orientation="right"
          allowDecimals={false}
          tickLine={false}
          {...yaxis}
        >
          <Label
            value={formatMessage(dashboardMessages.perPeriod, {
              period: formatMessage(PERIOD_MESSAGES[resolution_]),
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
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {legend_?.items
          .filter((l) => l.icon !== 'line')
          .map((l, l_i) => (
            <Bar
              key={l_i}
              dataKey={yBars[l_i] as string}
              yAxisId="bar"
              stackId="1"
              barSize={sizes.bar}
              fill={l.color}
              fillOpacity={1}
              name={l.label}
            />
          ))}
        <Line
          type="monotone"
          yAxisId="line"
          dataKey={yLine}
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          activeDot={Boolean(data && data?.length < 31)}
          stroke={legacyColors.line}
          fill={legacyColors.line}
          strokeWidth={1}
          name={formatMessage(dashboardMessages.total)}
        />
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {legend_ && graphDimensions && legendDimensions && (
          <g className="graph-legend">
            <Legend
              items={legend_.items}
              graphDimensions={graphDimensions}
              legendDimensions={legendDimensions}
              position={legend_.position}
              textColor={legend_.textColor}
              margin={margin}
            />
          </g>
        )}
      </ComposedChart>
    </Container>
  );
};

export default LineBarChart;
