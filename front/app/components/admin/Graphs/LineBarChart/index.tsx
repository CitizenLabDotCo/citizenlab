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

// i18n
import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import dashboardMessages from 'containers/Admin/dashboard/messages';

// utils
import { hasNoData, parseMargin } from '../utils';
import { toFullMonth } from 'utils/dateUtils';

// typings
import { Props } from './typings';
import {
  GraphDimensions,
  LegendDimensions,
} from '../_components/Legend/typings';
import { IResolution } from 'components/admin/ResolutionControl';

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

  const { x, yBar, yLine } = mapping;

  if (
    typeof x === 'symbol' ||
    typeof yBar === 'symbol' ||
    typeof yLine === 'symbol'
  ) {
    return null;
  }

  const resolution_: IResolution = resolution ?? 'month';

  const formatLabel = (date: string) => {
    return resolution ? toFullMonth(date, resolution) : date;
  };

  const legend: ILegend = {
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
        <Bar
          dataKey={yBar}
          yAxisId="bar"
          barSize={sizes.bar}
          fill={legacyColors.barFill}
          fillOpacity={1}
          name={formatMessage(dashboardMessages.totalForPeriod, {
            period: formatMessage(PERIOD_MESSAGES[resolution_]),
          })}
        />
        <Line
          type="monotone"
          yAxisId="line"
          dataKey={yLine}
          activeDot={Boolean(data && data?.length < 31)}
          stroke={legacyColors.line}
          fill={legacyColors.line}
          strokeWidth={1}
          name={formatMessage(dashboardMessages.total)}
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
