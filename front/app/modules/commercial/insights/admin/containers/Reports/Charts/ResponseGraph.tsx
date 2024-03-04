// libraries
import React, { memo } from 'react';

// resources

import { Box } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';
import { LabelList, LabelProps } from 'recharts';
import styled from 'styled-components';
import { IGraphPoint } from 'typings';

import BarChart from 'components/admin/Graphs/BarChart';
import { legacyColors } from 'components/admin/Graphs/styling';
import {
  IGraphUnit,
  GraphCardHeader,
  GraphCardTitle,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import ReportExportMenu from 'components/admin/ReportExportMenu';

import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  serie: IGraphPoint[] | undefined;
  graphTitleString: string;
  graphUnit: IGraphUnit;
  className?: string;
  customId?: string;
}

const StyledGraphCardInner = styled(GraphCardInner)`
  border: none;
`;

export const ResponseGraph = memo(
  ({ graphTitleString, serie }: Props & WrappedComponentProps) => {
    const currentChart: React.RefObject<any> = React.createRef();

    const NameLabel = (props: LabelProps) => {
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

    const ValueLabel = (props: LabelProps) => {
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
        <Box p="20px" pt="0px">
          <BarChart
            height={serie && serie?.length > 1 ? serie.length * 50 : 100}
            data={serie}
            mapping={{
              category: 'name',
              length: 'value',
            }}
            bars={{ name: 'Count', size: 5 }}
            layout="horizontal"
            innerRef={currentChart}
            margin={{ right: 20, top: 10 }}
            xaxis={{ hide: true }}
            yaxis={{ width: 150, tickLine: false, hide: true }}
            labels={() => (
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
        </Box>
      </StyledGraphCardInner>
    );
  }
);

const ResponseGraphWithHoCs = injectIntl(ResponseGraph);

export default ResponseGraphWithHoCs;
