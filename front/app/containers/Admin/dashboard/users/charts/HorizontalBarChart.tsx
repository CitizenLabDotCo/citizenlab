// libraries
import React from 'react';
import { isEmpty } from 'lodash-es';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// styling
import { withTheme } from 'styled-components';

// components
import {
  IGraphUnit,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import BarChart from 'components/admin/Graphs/BarChart';
import { DEFAULT_BAR_CHART_MARGIN } from 'components/admin/Graphs/constants';
import { LabelList } from 'recharts';
import ReportExportMenu from 'components/admin/ReportExportMenu';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';

// types
import { IStreamParams, IStream } from 'utils/streams';
import { IGraphFormat } from 'typings';

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
  Props & InjectedIntlProps
> {
  currentChart: React.RefObject<any>;
  constructor(props: Props & InjectedIntlProps) {
    super(props as any);
    this.currentChart = React.createRef();
  }
  render() {
    const { barSize } = this.props['theme'];
    const {
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
              />
            )}
          </GraphCardHeader>
          <BarChart
            height={!noData && serie.length > 1 ? serie.length * 50 : 100}
            data={serie}
            layout="horizontal"
            margin={DEFAULT_BAR_CHART_MARGIN}
            bars={{ name: unitName, size: graphUnit === 'ideas' ? 5 : barSize }}
            yaxis={{ width: 150, tickLine: false }}
            renderLabels={(props) => <LabelList {...props} />}
          />
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const HorizontalBarChartWithHoCs = injectIntl<Props>(
  withTheme(HorizontalBarChart as any) as any
);

const WrappedHorizontalBarChart = (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {(serie) => <HorizontalBarChartWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);

export default WrappedHorizontalBarChart;
