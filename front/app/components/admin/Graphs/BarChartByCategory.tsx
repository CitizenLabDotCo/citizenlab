// libraries
import React, { useRef } from 'react';
import { isEmpty } from 'lodash-es';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from '../../../containers/Admin/dashboard/messages';

// components
import ReportExportMenu from 'components/admin/ReportExportMenu';
import {
  IGraphUnit,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import BarChart from 'components/admin/Graphs/BarChart';
import { DEFAULT_BAR_CHART_MARGIN } from 'components/admin/Graphs/styling';

// resources

// utils
import { isNilOrError } from 'utils/helperUtils';

// types
import { IUsersByCustomField } from 'api/users_by_custom_field/types';
import useUsersByCustomField from 'api/users_by_custom_field/useUsersByCustomField';
import useLocalize from 'hooks/useLocalize';

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
}

export type GraphOption = {
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
