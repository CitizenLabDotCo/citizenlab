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
import { IGraphPoint } from 'typings';

interface VoteGraphPoint extends IGraphPoint {
  up: number;
  down: number;
  slug: string;
}

interface Props {
  serie: VoteGraphPoint[] | null;
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

  handleClick(data) {
    window.open(`${window.location.origin}/ideas/${data.slug}`);
  }

  render() {
    const {
      chartFill,
      chartLabelSize,
      chartCategorySize,
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
      children,
      ...queryProps
    } = this.props;

    const noData =
      !serie || serie.every((item) => isEmpty(item)) || serie.length <= 0;

    const unitName = formatMessage(messages[graphUnit]);

    const NameLabel = (props) => {
      const { x, y, value } = props;
      return (
        <g style={{ pointerEvents: 'none' }}>
          <text
            x={x}
            y={y}
            dx={30}
            dy={-6}
            fill={chartLabelColor}
            fontSize={chartCategorySize}
            textAnchor="left"
          >
            {value}
          </text>
        </g>
      );
    };

    const ValueLabel = (props) => {
      const { x, y, value } = props;
      return (
        <g style={{ pointerEvents: 'none' }}>
          <text
            x={x}
            y={y}
            dx={5}
            dy={-6}
            fill={chartLabelColor}
            fontSize={chartCategorySize}
            textAnchor="right"
            fontWeight={'800'}
          >
            {value}
          </text>
        </g>
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
                {...queryProps}
              />
            )}
          </GraphCardHeader>
          {noData ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <StyledResponsiveContainer
              height={serie && serie?.length > 1 ? serie.length * 50 : 100}
            >
              <BarChart
                data={serie}
                layout="vertical"
                ref={this.currentChart}
                margin={{ right: 20, top: 10 }}
              >
                <Bar
                  dataKey="value"
                  name="Total"
                  opacity={0}
                  barSize={['ideas', 'votes'].includes(graphUnit) ? 30 : 20}
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                  onClick={this.handleClick}
                  cursor="pointer"
                />
                <Bar
                  name="Downvotes"
                  stackId={'votes'}
                  dataKey="down"
                  fill={chartFill}
                  barSize={['ideas', 'votes'].includes(graphUnit) ? 5 : 20}
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                >
                  {graphUnit === 'ideas' &&
                    serie &&
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

                <Bar
                  name="Upvotes"
                  stackId={'votes'}
                  dataKey="up"
                  fill={chartFill}
                  opacity={0.7}
                  barSize={['ideas', 'votes'].includes(graphUnit) ? 5 : 20}
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                >
                  {graphUnit === 'ideas' &&
                    serie &&
                    serie.map((entry, index) => {
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={(entry.color && entry.color) || chartFill}
                          opacity={0.4}
                        />
                      );
                    })}
                </Bar>

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
                  active={false}
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
