// libraries
import React from 'react';
import { isEmpty } from 'lodash-es';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// styling
import { withTheme } from 'styled-components';

// components
import ExportMenu from '../../components/ExportMenu';
import {
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  IGraphUnit,
  NoDataContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from '../..';

import { IGraphFormat } from 'typings';

interface InputProps {
  className?: string;
  graphTitle: string;
  graphUnit: IGraphUnit;
  xlsxEndpoint: string;
  graphData: IGraphFormat;
  currentProjectFilter?: string | undefined;
  currentGroupFilter?: string | undefined;
  currentTopicFilter?: string | undefined;
  currentProjectFilterLabel?: string | undefined;
  currentGroupFilterLabel?: string | undefined;
  currentTopicFilterLabel?: string | undefined;
}

interface Props extends InputProps {}

export class HorizontalBarChart extends React.PureComponent<
  Props & InjectedIntlProps
> {
  currentChart: React.RefObject<any>;
  constructor(props: Props & InjectedIntlProps) {
    super(props as any);
    this.currentChart = React.createRef();
  }
  render() {
    const {
      chartFill,
      barFill,
      chartLabelSize,
      chartLabelColor,
      barHoverColor,
      animationBegin,
      animationDuration,
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter,
      currentGroupFilterLabel,
      currentTopicFilterLabel,
      currentProjectFilterLabel,
    } = this.props['theme'];
    const {
      xlsxEndpoint,
      className,
      graphTitle,
      graphData,
      intl: { formatMessage },
      graphUnit,
    } = this.props;

    const noData =
      !graphData ||
      graphData.every((item) => isEmpty(item)) ||
      graphData.length <= 0;

    const unitName = formatMessage(messages[graphUnit]);

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>{graphTitle}</GraphCardTitle>
            {!noData && (
              <ExportMenu
                name={graphTitle}
                svgNode={this.currentChart}
                xlsxEndpoint={xlsxEndpoint}
                currentGroupFilterLabel={currentGroupFilterLabel}
                currentGroupFilter={currentGroupFilter}
              />
            )}
          </GraphCardHeader>
          {noData ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <ResponsiveContainer
              height={graphData.length > 1 ? graphData.length * 50 : 100}
            >
              <BarChart
                data={graphData}
                layout="vertical"
                ref={this.currentChart}
              >
                <Bar
                  dataKey="value"
                  name={unitName}
                  fill={chartFill}
                  label={{
                    fill: barFill,
                    fontSize: chartLabelSize,
                    position: 'insideLeft',
                  }}
                  barSize={20}
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  tickLine={false}
                />
                <XAxis
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  type="number"
                  tick={{ transform: 'translate(0, 7)' }}
                />
                <Tooltip
                  isAnimationActive={false}
                  cursor={{ fill: barHoverColor }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(HorizontalBarChart as any) as any);
