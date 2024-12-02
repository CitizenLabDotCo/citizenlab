import React from 'react';

import { orderBy } from 'lodash-es';
import moment from 'moment';
import { WrappedComponentProps } from 'react-intl';

import { IUsersByCustomField } from 'api/users_by_custom_field/types';
import useUsersByCustomField from 'api/users_by_custom_field/useUsersByCustomField';
import { usersByCustomFieldXlsxEndpoint } from 'api/users_by_custom_field/util';

import messages from 'containers/Admin/dashboard/messages';

import { injectIntl } from 'utils/cl-intl';
import { convertDomicileData } from 'utils/dataUtils';
import { isNilOrError } from 'utils/helperUtils';
import localize, { InjectedLocalized } from 'utils/localize';

import HorizontalBarChart from './HorizontalBarChart';

interface Props {
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  customFieldId: string;
}

const fallbackMessages = {
  _blank: messages._blank,
};

const AreaChart = ({
  intl: { formatMessage },
  localize,
  startAt,
  endAt,
  currentGroupFilter,
  currentGroupFilterLabel,
  customFieldId,
}: Props & WrappedComponentProps & InjectedLocalized) => {
  const { data: usersByDomicile } = useUsersByCustomField({
    start_at: startAt ? moment(startAt).local().format('YYYY-MM-DD') : null,
    end_at: endAt ? moment(endAt).local().format('YYYY-MM-DD') : null,
    group: currentGroupFilter,
    id: customFieldId,
  });

  const convertToGraphFormat = (data: IUsersByCustomField) => {
    if (isNilOrError(data)) return null;

    const { series, options } = data.data.attributes;

    const parseName = (key, value) =>
      key in fallbackMessages
        ? formatMessage(fallbackMessages[key])
        : localize(value.title_multiloc);

    const res = convertDomicileData(options, series.users, parseName);
    const sortedByValue = orderBy(res, 'value', 'desc');
    return sortedByValue.length > 0 ? sortedByValue : null;
  };

  return (
    <HorizontalBarChart
      startAt={startAt}
      endAt={endAt}
      currentGroupFilter={currentGroupFilter}
      currentGroupFilterLabel={currentGroupFilterLabel}
      graphTitleString={formatMessage(messages.usersByDomicileTitle)}
      graphUnit="users"
      serie={
        usersByDomicile ? convertToGraphFormat(usersByDomicile) : undefined
      }
      className="dynamicHeight"
      xlsxEndpoint={usersByCustomFieldXlsxEndpoint(customFieldId)}
    />
  );
};

const WrappedAreaChart = injectIntl(
  localize<Props & WrappedComponentProps>(AreaChart)
);

export default WrappedAreaChart;
