// libraries
import React from 'react';
import { isEmpty } from 'lodash-es';

// intl
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../../messages';

// styling
import {
  sizes,
  DEFAULT_BAR_CHART_MARGIN,
} from 'components/admin/Graphs/styling';

// components
import {
  IGraphUnit,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import BarChart from 'components/admin/Graphs/BarChart';
import ReportExportMenu from 'components/admin/ReportExportMenu';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';

// utils
import { isNilOrError } from 'utils/helperUtils';

// types
import { IStreamParams, IStream } from 'utils/streams';
import { IGraphFormat } from 'typings';
import {
  IUsersByBirthyear,
  IUsersByDomicile,
  IUsersByRegistrationField,
} from 'services/userCustomFieldStats';

interface DataProps {
  serie?: IGraphFormat | null | Error;
}

type ISupportedDataType =
  | IUsersByBirthyear
  | IUsersByDomicile
  | IUsersByRegistrationField;

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
                xlsx={xlsxEndpoint ? { endpoint: xlsxEndpoint } : undefined}
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
