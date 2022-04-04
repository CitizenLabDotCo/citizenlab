// libraries
import React, { memo } from 'react';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// styling
import styled, { useTheme } from 'styled-components';

// resources
import { isNilOrError } from 'utils/helperUtils';

// components
import {
  IGraphUnit,
  GraphCardHeader,
  GraphCardTitle,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import BarChart from 'components/admin/Graphs/BarChart';
import { LabelList } from 'recharts';

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

const StyledBarChart = styled(BarChart)`
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
    const { chartCategorySize, chartLabelColor }: any = useTheme();
    const currentChart: React.RefObject<any> = React.createRef();

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
        <StyledBarChart
          height={serie && serie?.length > 1 ? serie.length * 50 : 100}
          data={serie}
          layout="horizontal"
          innerRef={currentChart}
          margin={{ right: 20, top: 10 }}
          bars={{ name: 'Count', size: 5 }}
          xaxis={{ hide: true }}
          yaxis={{ width: 150, tickLine: false, hide: true }}
          renderLabels={() => (
            <>
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
            </>
          )}
        />
      </StyledGraphCardInner>
    );
  }
);

const ResponseGraphWithHoCs = injectIntl(ResponseGraph);

export default ResponseGraphWithHoCs;
