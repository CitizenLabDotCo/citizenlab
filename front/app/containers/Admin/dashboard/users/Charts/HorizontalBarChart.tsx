import React from 'react';

import { isEmpty } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';
import { IGraphFormat } from 'typings';

import BarChart from 'components/admin/Graphs/BarChart';
import {
  sizes,
  DEFAULT_BAR_CHART_MARGIN,
} from 'components/admin/Graphs/styling';
import {
  IGraphUnit,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import ReportExportMenu from 'components/admin/ReportExportMenu';

import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';

interface Props {
  serie?: IGraphFormat | null | Error;
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

export class HorizontalBarChart extends React.PureComponent<
  Props & WrappedComponentProps
> {
  currentChart: React.RefObject<any>;
  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.currentChart = React.createRef();
  }
  render() {
    const {
      startAt,
      endAt,
      className,
      graphTitleString,
      currentGroupFilter,
      currentGroupFilterLabel,
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
                currentGroupFilter={currentGroupFilter}
                currentGroupFilterLabel={currentGroupFilterLabel}
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

export default HorizontalBarChartWithHoCs;
