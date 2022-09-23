// libraries
import React from 'react';

// intl
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import messages from '../../messages';

// styling
import { legacyColors } from 'components/admin/Graphs/styling';
import { withTheme } from 'styled-components';

// components
import PieChart from 'components/admin/Graphs/PieChart';
import {
  GraphCard,
  GraphCardHeader,
  GraphCardInner,
  GraphCardTitle,
  IGraphUnit,
  NoDataContainer,
  PieChartStyleFixesDiv,
} from 'components/admin/GraphWrappers';
import ReportExportMenu from 'components/admin/ReportExportMenu';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';

// typings
import { IStream, IStreamParams } from 'utils/streams';

import { IGraphFormat } from 'typings';

interface DataProps {
  serie: IGraphFormat;
}

export interface ISupportedDataTypeMap {}

export type ISupportedDataType =
  ISupportedDataTypeMap[keyof ISupportedDataTypeMap];

interface InputProps {
  stream: (
    streamParams?: IStreamParams | null,
    customId?: string
  ) => IStream<ISupportedDataType>;
  convertToGraphFormat: (ISupportedDataType) => IGraphFormat | null;
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  graphTitleString: string;
  graphUnit: IGraphUnit;
  className?: string;
  customId: string;
  xlsxEndpoint: string;
}

interface Props extends InputProps, DataProps {}

export const piechartColors = [
  legacyColors.pinkRed,
  legacyColors.lightBlue,
  legacyColors.lightGreen,
  legacyColors.grey,
];

class PieChartByCategory extends React.PureComponent<
  Props & WrappedComponentProps
> {
  currentChart: React.RefObject<any>;

  constructor(props: Props & WrappedComponentProps) {
    super(props as any);
    this.currentChart = React.createRef();
  }

  render() {
    const { colorMain } = this.props['theme'];
    const {
      startAt,
      endAt,
      className,
      graphTitleString,
      serie,
      xlsxEndpoint,
      currentGroupFilter,
      currentGroupFilterLabel,
    } = this.props;

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>{graphTitleString}</GraphCardTitle>
            {serie && (
              <ReportExportMenu
                name={graphTitleString}
                svgNode={this.currentChart}
                xlsxEndpoint={xlsxEndpoint}
                currentGroupFilter={currentGroupFilter}
                currentGroupFilterLabel={currentGroupFilterLabel}
                startAt={startAt}
                endAt={endAt}
              />
            )}
          </GraphCardHeader>
          {!serie ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <PieChartStyleFixesDiv>
              <PieChart
                data={serie}
                mapping={{
                  angle: 'value',
                  name: 'name',
                  fill: ({ rowIndex }) => piechartColors[rowIndex] ?? colorMain,
                }}
                pie={{
                  startAngle: 0,
                  endAngle: 360,
                  innerRadius: 60,
                }}
                annotations
                tooltip
                innerRef={this.currentChart}
              />
            </PieChartStyleFixesDiv>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const PieChartByCategoryWithHoCs = injectIntl(
  withTheme(PieChartByCategory as any) as any
);

const WrappedPieChartByCategory = (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {(serie) => <PieChartByCategoryWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);

export default WrappedPieChartByCategory;
