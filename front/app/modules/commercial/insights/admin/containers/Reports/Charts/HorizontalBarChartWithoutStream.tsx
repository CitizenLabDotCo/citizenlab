// libraries
import React, { memo } from 'react';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';

// styling
import styled from 'styled-components';
import {
  legacyColors,
  sizes,
  animation,
} from 'components/admin/Graphs/styling';

// resources
import { isNilOrError } from 'utils/helperUtils';

// components
import {
  BarChart,
  Bar,
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
} from 'components/admin/GraphWrappers';

// types
import { IGraphPoint } from 'typings';
import ReportExportMenu from 'components/admin/ReportExportMenu';

interface VoteGraphPoint extends IGraphPoint {
  up: number;
  down: number;
  slug: string;
  ordering?: number;
  color?: string;
}

interface Props {
  serie: VoteGraphPoint[] | undefined;
  graphTitleString: string;
  graphUnit: IGraphUnit;
  className?: string;
  customId?: string;
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

export const HorizontalBarChartWithoutStream: React.SFC<
  Props & WrappedComponentProps
> = memo(({ className, graphTitleString, serie, graphUnit }) => {
  const currentChart: React.RefObject<any> = React.createRef();

  const openIdeaInANewTab = ({ slug }: { slug: string }) => {
    if (!isNilOrError(slug)) {
      window.open(`${window.location.origin}/ideas/${slug}`);
    }
  };

  const NameLabel = (props) => {
    const { x, y, value } = props;
    return (
      <g style={{ pointerEvents: 'none' }}>
        <text
          x={x}
          y={y}
          dx={30}
          dy={-6}
          fill={legacyColors.chartLabel}
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
          fill={legacyColors.chartLabel}
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
          {!isNilOrError(serie) && (
            <ReportExportMenu svgNode={currentChart} name={graphTitleString} />
          )}
        </GraphCardHeader>
        {isNilOrError(serie) ? (
          <NoDataContainer>
            <FormattedMessage {...messages.noData} />
          </NoDataContainer>
        ) : (
          <StyledResponsiveContainer
            height={serie?.length > 1 ? serie.length * 50 : 100}
          >
            <BarChart
              data={serie}
              layout="vertical"
              ref={currentChart}
              margin={{ right: 20, top: 10 }}
            >
              <Bar
                dataKey="value"
                name="Total"
                opacity={0}
                barSize={
                  ['ideas', 'votes'].includes(graphUnit) ? 30 : sizes.bar
                }
                animationDuration={animation.duration}
                animationBegin={animation.begin}
                onClick={openIdeaInANewTab}
                cursor="pointer"
              />
              <Bar
                name="Downvotes"
                stackId={'votes'}
                dataKey="down"
                fill={legacyColors.barFill}
                barSize={['ideas', 'votes'].includes(graphUnit) ? 5 : sizes.bar}
                animationDuration={animation.duration}
                animationBegin={animation.begin}
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
                          fill={
                            (entry.color && entry.color) || legacyColors.barFill
                          }
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
                fill={legacyColors.barFill}
                opacity={0.7}
                barSize={['ideas', 'votes'].includes(graphUnit) ? 5 : sizes.bar}
                animationDuration={animation.duration}
                animationBegin={animation.begin}
              >
                {graphUnit === 'ideas' &&
                  serie.map((entry, index) => {
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          (entry.color && entry.color) || legacyColors.barFill
                        }
                        opacity={0.4}
                      />
                    );
                  })}
              </Bar>

              <YAxis
                dataKey="name"
                type="category"
                width={150}
                stroke={legacyColors.chartLabel}
                fontSize={sizes.chartLabel}
                tickLine={false}
                hide={true}
              />
              <XAxis
                stroke={legacyColors.chartLabel}
                fontSize={sizes.chartLabel}
                type="number"
                tick={{ transform: 'translate(0, 7)' }}
                hide={true}
              />
            </BarChart>
          </StyledResponsiveContainer>
        )}
      </GraphCardInner>
    </GraphCard>
  );
});

const HorizontalBarChartWithoutStreamWithHoCs = injectIntl<
  Props & WrappedComponentProps
>(HorizontalBarChartWithoutStream);

export default HorizontalBarChartWithoutStreamWithHoCs;
