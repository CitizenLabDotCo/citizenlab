import React from 'react';

import { orderBy } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';

import { IUsersByCustomField } from 'api/users_by_custom_field/types';
import useUsersByCustomField from 'api/users_by_custom_field/useUsersByCustomField';
import { usersByDomicileXlsxEndpoint } from 'api/users_by_domicile/util';

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

const AreaChart = (
  props: Props & WrappedComponentProps & InjectedLocalized
) => {
  const {
    intl: { formatMessage },
    localize,
  } = props;

  const { data: usersByDomicile } = useUsersByCustomField({
    start_at: props.startAt,
    end_at: props.endAt,
    group: props.currentGroupFilter,
    id: props.customFieldId,
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
      {...props}
      graphTitleString={formatMessage(messages.usersByDomicileTitle)}
      graphUnit="users"
      serie={
        usersByDomicile ? convertToGraphFormat(usersByDomicile) : undefined
      }
      className="dynamicHeight"
      xlsxEndpoint={usersByDomicileXlsxEndpoint}
    />
  );
};

const WrappedAreaChart = injectIntl(
  localize<Props & WrappedComponentProps>(AreaChart)
);

export default WrappedAreaChart;
