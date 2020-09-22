// libraries
import React from 'react';
import { isEmpty } from 'lodash-es';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// styling
import styled, { withTheme } from 'styled-components';

// components
import ExportMenu from '../../components/ExportMenu';
import {
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import {
  IGraphUnit,
  NoDataContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from '../..';

// types
import { IGraphFormat } from 'typings';

interface InputProps {
  serie: IGraphFormat | null;
  startAt?: string | null | undefined;
  endAt?: string | null;
  currentGroupFilter?: string | undefined;
  currentGroupFilterLabel?: string | undefined;
  currentProjectFilter?: string | undefined;
  graphTitleString: string;
  graphUnit: IGraphUnit;
  className?: string;
  customId?: string;
  xlsxEndpoint: string;
}

interface Props extends InputProps {}

const StyledResponsiveContainer = styled(ResponsiveContainer)`
  .recharts-wrapper {
    @media print {
      margin: 0 auto;
    }
    padding: 20px;
    padding-top: 0px;
  }
`;

export class HorizontalBarChartWithoutStream extends React.PureComponent<
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
      chartLabelSize,
      chartLabelColor,
      barHoverColor,
      animationBegin,
      animationDuration,
    } = this.props['theme'];
    const {
      className,
      graphTitleString,
      serie,
      intl: { formatMessage },
      graphUnit,
      ...rest
    } = this.props;

    const noData =
      !serie || serie.every((item) => isEmpty(item)) || serie.length <= 0;

    const unitName = formatMessage(messages[graphUnit]);

    const NameLabel = (props) => {
      console.log(props);
      const { x, y, value } = props;
      return (
        <text
          x={x}
          y={y}
          dx={30}
          dy={-6}
          fontFamily="sans-serif"
          fill={chartLabelColor}
          fontSize={chartLabelSize}
          textAnchor="left"
        >
          {value}
        </text>
      );
    };

    const ValueLabel = (props) => {
      console.log(props);
      const { x, y, value } = props;
      return (
        <text
          x={x}
          y={y}
          dx={5}
          dy={-6}
          fontFamily="sans-serif"
          fill={chartLabelColor}
          fontSize={chartLabelSize}
          textAnchor="right"
          fontWeight={'800'}
        >
          {value}
        </text>
      );
    };

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>{graphTitleString}</GraphCardTitle>
            {!noData && (
              <ExportMenu
                name={graphTitleString}
                svgNode={this.currentChart}
                {...rest}
              />
            )}
          </GraphCardHeader>
          {noData ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <StyledResponsiveContainer
              height={serie.length > 1 ? serie.length * 50 : 100}
            >
              <BarChart
                data={serie}
                layout="vertical"
                ref={this.currentChart}
                margin={{ right: 20, top: 10 }}
              >
                <Bar
                  dataKey="value"
                  name={unitName}
                  fill={chartFill}
                  barSize={['ideas', 'votes'].includes(graphUnit) ? 5 : 20}
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                >
                  {graphUnit === 'ideas' &&
                    serie
                      .sort((a, b) =>
                        a.ordering && b.ordering ? a.ordering - b.ordering : -1
                      )
                      .map((entry, index) => {
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={(entry.color && entry.color) || chartFill}
                            opacity={0.8}
                          />
                        );
                      })}
                  <LabelList
                    dataKey="name"
                    position="top"
                    content={<NameLabel />}
                  />
                  <LabelList
                    dataKey="value"
                    position="insideTopRight"
                    offset={-20}
                    content={<ValueLabel />}
                  />
                </Bar>
                {/* <Label label="{timeTaken}" labelFormatter={(name) => 'Time Taken: ' + name}/> */}
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  tickLine={false}
                  hide={true}
                />
                <XAxis
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  type="number"
                  tick={{ transform: 'translate(0, 7)' }}
                  hide={true}
                />
                <Tooltip
                  isAnimationActive={false}
                  cursor={{ fill: barHoverColor }}
                />
              </BarChart>
            </StyledResponsiveContainer>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const HorizontalBarChartWithoutStreamWithHoCs = injectIntl<Props>(
  withTheme(HorizontalBarChartWithoutStream as any) as any
);

export default HorizontalBarChartWithoutStreamWithHoCs;
