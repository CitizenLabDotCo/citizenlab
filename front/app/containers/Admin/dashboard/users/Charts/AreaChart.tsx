// Libraries
import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { orderBy } from 'lodash-es';
// services
import {
  IUsersByDomicile,
  usersByDomicileStream,
  usersByDomicileXlsxEndpoint,
} from 'services/userCustomFieldStats';
// i18n
import { injectIntl } from 'utils/cl-intl';
import { convertDomicileData } from 'utils/dataUtils';
// utils
import { isNilOrError } from 'utils/helperUtils';
import localize, { InjectedLocalized } from 'utils/localize';
import messages from 'containers/Admin/dashboard/messages';
// components
import HorizontalBarChart from './HorizontalBarChart';

interface Props {
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  className?: string;
}

export const fallbackMessages = {
  _blank: messages._blank,
  outside: messages.otherArea,
};

const AreaChart = (
  props: Props & WrappedComponentProps & InjectedLocalized
) => {
  const {
    intl: { formatMessage },
    localize,
  } = props;

  const convertToGraphFormat = (data: IUsersByDomicile) => {
    if (isNilOrError(data)) return null;

    const { series, areas } = data;

    const parseName = (key, value) =>
      key in fallbackMessages
        ? formatMessage(fallbackMessages[key])
        : localize(value.title_multiloc);

    const res = convertDomicileData(areas, series.users, parseName);
    const sortedByValue = orderBy(res, 'value', 'desc');
    return sortedByValue.length > 0 ? sortedByValue : null;
  };

  return (
    <HorizontalBarChart
      {...props}
      graphTitleString={formatMessage(messages.usersByDomicileTitle)}
      graphUnit="users"
      stream={usersByDomicileStream}
      convertToGraphFormat={convertToGraphFormat}
      className="dynamicHeight"
      xlsxEndpoint={usersByDomicileXlsxEndpoint}
    />
  );
};

const WrappedAreaChart = injectIntl(
  localize<Props & WrappedComponentProps>(AreaChart)
);

export default WrappedAreaChart;
