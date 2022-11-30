// libraries
import React from 'react';
import { isEmpty, map, orderBy } from 'lodash-es';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';

// styling
import {
  legacyColors,
  sizes,
  DEFAULT_BAR_CHART_MARGIN,
} from 'components/admin/Graphs/styling';

// components
import ReportExportMenu from 'components/admin/ReportExportMenu';
import {
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import BarChart from 'components/admin/Graphs/BarChart';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';

// types
import { ideasByStatusStream, ideasByStatusXlsxEndpoint } from 'services/stats';
import { IGraphFormat } from 'typings';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface DataProps {
  serie?: IGraphFormat | null | Error;
}

interface InputProps {
  startAt: string | null | undefined;
  endAt: string | null;
  currentProjectFilter?: string | undefined;
  currentGroupFilter?: string | undefined;
  currentGroupFilterLabel?: string | undefined;
  className?: string;
}

interface Props extends InputProps, DataProps {}

export class IdeasByStatusChart extends React.PureComponent<
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
      className,
      serie,
      intl: { formatMessage },
    } = this.props;

    const noData =
      isNilOrError(serie) ||
      serie.every((item) => isEmpty(item)) ||
      serie.length <= 0;

    const unitName = formatMessage(messages.inputs);
    const sortedByValue = noData
      ? null
      : (orderBy(serie, ['value'], ['desc']) as IGraphFormat);

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <FormattedMessage {...messages.inputsByStatusTitle} />
            </GraphCardTitle>
            {!noData && (
              <ReportExportMenu
                name={formatMessage(messages.inputsByStatusTitle)}
                svgNode={this.currentChart}
                xlsx={{ endpoint: ideasByStatusXlsxEndpoint }}
                currentGroupFilterLabel={currentGroupFilterLabel}
                currentGroupFilter={currentGroupFilter}
                startAt={startAt}
                endAt={endAt}
              />
            )}
          </GraphCardHeader>
          <BarChart
            height={
              !noData && sortedByValue !== null && sortedByValue.length > 1
                ? sortedByValue.length * 50
                : 100
            }
            data={sortedByValue}
            mapping={{
              category: 'name',
              length: 'value',
              fill: ({ row: { color } }) => color ?? legacyColors.chartFill,
              opacity: () => 0.8,
            }}
            layout="horizontal"
            innerRef={this.currentChart}
            margin={DEFAULT_BAR_CHART_MARGIN}
            bars={{
              name: unitName,
              size: sizes.bar,
            }}
            yaxis={{ width: 150, tickLine: false }}
            labels
            tooltip
          />
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const IdeasByStatusChartWithHoCs = injectIntl(IdeasByStatusChart);

const WrappedIdeasByStatusChart = (
  inputProps: InputProps & InjectedLocalized
) => {
  const convertToGraphFormat = ({ series: { ideas }, idea_status }) => {
    if (Object.keys(ideas).length <= 0) {
      return null;
    }

    return map(idea_status, (status, id) => ({
      value: ideas[id] || 0,
      name: inputProps.localize(status.title_multiloc),
      code: id,
      color: status.color,
      ordering: status.ordering,
    }));
  };
  return (
    <GetSerieFromStream
      {...inputProps}
      stream={ideasByStatusStream}
      convertToGraphFormat={convertToGraphFormat}
    >
      {(serie) => <IdeasByStatusChartWithHoCs {...serie} {...inputProps} />}
    </GetSerieFromStream>
  );
};

export default injectLocalize(WrappedIdeasByStatusChart);
