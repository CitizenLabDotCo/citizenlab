import React, { useRef } from 'react';

import { isEmpty } from 'lodash-es';

import { IUsersByCustomField } from 'api/users_by_custom_field/types';
import useUsersByCustomField from 'api/users_by_custom_field/useUsersByCustomField';

import useLocalize from 'hooks/useLocalize';

import BarChart from 'components/admin/Graphs/BarChart';
import { DEFAULT_BAR_CHART_MARGIN } from 'components/admin/Graphs/styling';
import {
  IGraphUnit,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import ReportExportMenu from 'components/admin/ReportExportMenu';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../../containers/Admin/dashboard/messages';

interface Props {
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  graphTitleString: string;
  graphUnit: IGraphUnit;
  className?: string;
  customId?: string;
  xlsxEndpoint: string;
  showExportMenu?: boolean;
  id: string;
  project?: string;
}

type GraphOption = {
  value: number;
  name: string;
  code: string;
};

const BarChartByCategory = ({
  startAt,
  endAt,
  currentGroupFilterLabel,
  currentGroupFilter,
  xlsxEndpoint,
  className,
  graphTitleString,
  graphUnit,
  showExportMenu = true,
  id,
  project,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const currentChart = useRef<any>();

  const convertToGraphFormat = (data: IUsersByCustomField) => {
    const {
      series: { users },
      options,
    } = data.data.attributes;
    let res: GraphOption[] = [];
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (options) {
      res = Object.entries(options)
        .sort((a, b) => a[1].ordering - b[1].ordering)
        .map(([key, value]) => ({
          value: users[key] || 0,
          name: localize(value.title_multiloc),
          code: key,
        }));
    }

    if (users['_blank']) {
      res.push({
        value: users['_blank'],
        name: formatMessage(messages._blank),
        code: '_blank',
      });
    }

    return res.length > 0 ? res : null;
  };

  const { data: usersByCustomField } = useUsersByCustomField({
    start_at: startAt,
    end_at: endAt,
    group: currentGroupFilter,
    id,
    enabled: true,
    project,
  });

  const serie = usersByCustomField && convertToGraphFormat(usersByCustomField);

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
          {!noData && showExportMenu && (
            <ReportExportMenu
              name={graphTitleString}
              svgNode={currentChart}
              xlsx={{ endpoint: xlsxEndpoint }}
              currentGroupFilterLabel={currentGroupFilterLabel}
              currentGroupFilter={currentGroupFilter}
              startAt={startAt}
              endAt={endAt}
              currentProjectFilter={project}
            />
          )}
        </GraphCardHeader>
        <BarChart
          data={serie}
          innerRef={currentChart}
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
};

export default BarChartByCategory;
