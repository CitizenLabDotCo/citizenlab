// libraries
import { isEmpty } from 'lodash-es';
import React from 'react';

// intl
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../../messages';

// components
import BarChart from 'components/admin/Graphs/BarChart';
import { DEFAULT_BAR_CHART_MARGIN } from 'components/admin/Graphs/styling';
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

// utils
import { isNilOrError } from 'utils/helperUtils';

// types
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
  convertToGraphFormat: (data: ISupportedDataType) => IGraphFormat | null;
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  graphTitleString: string;
  graphUnit: IGraphUnit;
  className?: string;
  customId?: string;
  xlsxEndpoint: string;
}

interface Props extends InputProps, DataProps {}

export class BarChartByCategory extends React.PureComponent<
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
      currentGroupFilterLabel,
      currentGroupFilter,
      xlsxEndpoint,
      className,
      graphTitleString,
      serie,
      intl: { formatMessage },
      graphUnit,
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
                name={graphTitleString}
                svgNode={this.currentChart}
                xlsxEndpoint={xlsxEndpoint}
                currentGroupFilterLabel={currentGroupFilterLabel}
                currentGroupFilter={currentGroupFilter}
                startAt={startAt}
                endAt={endAt}
              />
            )}
          </GraphCardHeader>
          <BarChart
            data={serie}
            innerRef={this.currentChart}
            margin={DEFAULT_BAR_CHART_MARGIN}
            mapping={{
              category: 'name',
              length: 'value',
            }}
            bars={{ name: unitName }}
            labels
            tooltip
          />
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const BarChartByCategoryWithHoCs = injectIntl(BarChartByCategory);

const WrappedBarChartByCategory = (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {(serie) => <BarChartByCategoryWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);

export default WrappedBarChartByCategory;
