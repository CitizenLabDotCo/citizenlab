// libraries
import React from 'react';
import { isEmpty, map, orderBy } from 'lodash-es';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// styling
import { withTheme } from 'styled-components';

// components
import ReportExportMenu from 'components/admin/ReportExportMenu';
import {
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
// import BarChart from 'components/admin/Graphs/BarChart';
import MultiBarChart from 'components/admin/Graphs/MultiBarChart';
import { DEFAULT_BAR_CHART_MARGIN } from 'components/admin/Graphs/constants';
import { Tooltip, LabelList } from 'recharts';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';

// types
import { ideasByStatusStream, ideasByStatusXlsxEndpoint } from 'services/stats';
import { IGraphFormat } from 'typings';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

interface DataProps {
  serie: IGraphFormat;
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
  Props & InjectedIntlProps
> {
  currentChart: React.RefObject<any>;
  constructor(props: Props & InjectedIntlProps) {
    super(props as any);
    this.currentChart = React.createRef();
  }

  render() {
    // const { chartFill, barSize } = this.props['theme'];
    const {
      currentGroupFilterLabel,
      currentGroupFilter,
      className,
      serie,
      intl: { formatMessage },
    } = this.props;

    const noData =
      !serie || serie.every((item) => isEmpty(item)) || serie.length <= 0;

    const unitName = formatMessage(messages.inputs);
    const sortedByValue = orderBy(serie, ['value'], ['desc']);

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
                xlsxEndpoint={ideasByStatusXlsxEndpoint}
                currentGroupFilterLabel={currentGroupFilterLabel}
                currentGroupFilter={currentGroupFilter}
              />
            )}
          </GraphCardHeader>
          <MultiBarChart
            height={sortedByValue.length > 1 ? sortedByValue.length * 50 : 100}
            data={sortedByValue}
            layout="vertical"
            innerRef={this.currentChart}
            margin={DEFAULT_BAR_CHART_MARGIN}
            mapping={{ length: ['value', 'value'] }}
            bars={{
              name: unitName,
              fill: ['red', 'green'],
            }}
            yaxis={{ width: 150, tickLine: false }}
            renderLabels={(props) => <LabelList {...props} />}
            renderTooltip={(props) => <Tooltip {...props} />}
          />
          {/* <BarChart
            height={sortedByValue.length > 1 ? sortedByValue.length * 50 : 100}
            data={sortedByValue}
            layout="horizontal"
            innerRef={this.currentChart}
            margin={DEFAULT_BAR_CHART_MARGIN}
            mapping={{ fill: 'color' }}
            bars={{
              name: unitName,
              fill: chartFill,
              size: barSize,
              opacity: 0.8,
            }}
            yaxis={{ width: 150, tickLine: false }}
            renderLabels={(props) => <LabelList {...props} position="right" />}
            renderTooltip={(props) => <Tooltip {...props} />}
          /> */}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const IdeasByStatusChartWithHoCs = injectIntl<Props>(
  withTheme(IdeasByStatusChart as any) as any
);

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
