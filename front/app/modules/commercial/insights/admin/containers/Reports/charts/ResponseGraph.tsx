// libraries
import React, { memo } from 'react';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// styling
import styled, { useTheme } from 'styled-components';

// resources
import { isNilOrError } from 'utils/helperUtils';

// components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import {
  IGraphUnit,
  NoDataContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCardInner,
} from 'components/admin/Chart';

// types
import { IGraphPoint } from 'typings';
import ReportExportMenu from 'components/admin/ReportExportMenu';

interface Props {
  serie: IGraphPoint[] | undefined;
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

const StyledGraphCardInner = styled(GraphCardInner)`
  border: none;
`;

export const ResponseGraph = memo(
  ({ graphTitleString, serie }: Props & InjectedIntlProps) => {
    const theme: any = useTheme();

    const currentChart: React.RefObject<any> = React.createRef();

    const {
      chartLabelSize,
      chartCategorySize,
      chartLabelColor,
      animationBegin,
      animationDuration,
      newBarFill,
    } = theme;

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
            {value || '0'}
          </text>
        </g>
      );
    };

    return (
      <StyledGraphCardInner>
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
                name="Count"
                dataKey="value"
                fill={newBarFill}
                barSize={5}
                animationDuration={animationDuration}
                animationBegin={animationBegin}
              >
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
            </BarChart>
          </StyledResponsiveContainer>
        )}
      </StyledGraphCardInner>
    );
  }
);

const ResponseGraphWithHoCs = injectIntl(ResponseGraph);

export default ResponseGraphWithHoCs;
