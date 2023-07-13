// libraries
import React, { useRef } from 'react';
import { isEmpty, map, orderBy } from 'lodash-es';

// intl
import { FormattedMessage, useIntl } from 'utils/cl-intl';
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

// types
import { IGraphFormat } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { ideasByStatusXlsxEndpoint } from 'api/ideas_by_status/util';
import useIdeasByStatus from 'api/ideas_by_status/useIdeasByStatus';
import useLocalize from 'hooks/useLocalize';

interface Props {
  startAt: string | null | undefined;
  endAt: string | null;
  currentProjectFilter?: string | undefined;
  currentGroupFilter?: string | undefined;
  currentGroupFilterLabel?: string | undefined;
  className?: string;
}

const IdeasByStatusChart = ({
  startAt,
  endAt,
  currentGroupFilterLabel,
  currentGroupFilter,
  currentProjectFilter,
  className,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const currentChart = useRef();

  const { data: ideasByStatus } = useIdeasByStatus({
    start_at: startAt,
    end_at: endAt,
    project: currentProjectFilter,
    group: currentGroupFilter,
  });

  if (!ideasByStatus) return null;

  const convertToGraphFormat = () => {
    const {
      series: { ideas },
      idea_status,
    } = ideasByStatus.data.attributes;

    if (Object.keys(ideas).length <= 0) {
      return null;
    }

    return map(idea_status, (status, id) => ({
      value: ideas[id] || 0,
      name: localize(status.title_multiloc),
      code: id,
      color: status.color,
      ordering: status.ordering,
    }));
  };

  const serie = convertToGraphFormat();

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
              svgNode={currentChart}
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
          innerRef={currentChart}
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
};

export default IdeasByStatusChart;
