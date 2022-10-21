// libraries
import { isEmpty } from 'lodash-es';
import React from 'react';

// intl
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../../messages';

// styling
import {
  DEFAULT_BAR_CHART_MARGIN,
  sizes,
} from 'components/admin/Graphs/styling';

// components
import BarChart from 'components/admin/Graphs/BarChart';
import {
  GraphCard,
  GraphCardHeader,
  GraphCardInner,
  GraphCardTitle,
  IGraphUnit,
} from 'components/admin/GraphWrappers';
import ReportExportMenu from 'components/admin/ReportExportMenu';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';

// types
import { IGraphFormat } from 'typings';
import { IStream, IStreamParams } from 'utils/streams';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface DataProps {
  serie?: IGraphFormat | null | Error;
}

export interface ISupportedDataTypeMap {}

export type ISupportedDataType =
  ISupportedDataTypeMap[keyof ISupportedDataTypeMap];

interface InputProps {
  stream: (
    streamParams?: IStreamParams | null,
    customId?: string
  ) => IStream<ISupportedDataType>;
  convertToGraphFormat: (data: ISupportedDataType) => IGraphFormat | null;
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter?: string | undefined;
  currentGroupFilterLabel?: string | undefined;
  graphTitleString: string;
  graphUnit: IGraphUnit;
  className?: string;
  customId?: string;
  xlsxEndpoint?: string;
}

interface Props extends InputProps, DataProps {}

export class HorizontalBarChart extends React.PureComponent<
  Props & WrappedComponentProps
> {
  currentChart: React.RefObject<any>;
  constructor(props: Props & WrappedComponentProps) {
    super(props as any);
    this.currentChart = React.createRef();
  }
  render() {
    const {
      startAt,
      endAt,
      className,
      graphTitleString,
      serie,
      intl: { formatMessage },
      graphUnit,
      xlsxEndpoint,
    } = this.props;

    const noData =
      isNilOrError(serie) ||
      serie.every((item) => isEmpty(item)) ||
      serie.length <= 0;

    const unitName = formatMessage(messages[graphUnit]);

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>{graphTitleString}</GraphCardTitle>
            {!noData && (
              <ReportExportMenu
                svgNode={this.currentChart}
                xlsxEndpoint={xlsxEndpoint}
                name={graphTitleString}
                startAt={startAt}
                endAt={endAt}
              />
            )}
          </GraphCardHeader>
          <BarChart
            innerRef={this.currentChart}
            height={!noData && serie.length > 1 ? serie.length * 50 : 100}
            data={serie}
            mapping={{
              category: 'name',
              length: 'value',
            }}
            bars={{
              name: unitName,
              size: graphUnit === 'ideas' ? 5 : sizes.bar,
            }}
            layout="horizontal"
            margin={DEFAULT_BAR_CHART_MARGIN}
            yaxis={{ width: 150, tickLine: false }}
            labels
          />
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const HorizontalBarChartWithHoCs = injectIntl(HorizontalBarChart);

const WrappedHorizontalBarChart = (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {(serie) => <HorizontalBarChartWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);

export default WrappedHorizontalBarChart;
