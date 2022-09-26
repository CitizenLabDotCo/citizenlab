// Libraries
import { orderBy } from 'lodash-es';
import React from 'react';

// i18n
import messages from 'containers/Admin/dashboard/messages';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import localize, { InjectedLocalized } from 'utils/localize';

// services
import {
  IUsersByDomicile,
  usersByDomicileStream,
  usersByDomicileXlsxEndpoint,
} from 'modules/commercial/user_custom_fields/services/stats';

// components
import HorizontalBarChart from 'containers/Admin/dashboard/users/charts/HorizontalBarChart';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { convertDomicileData } from '../../utils/data';

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
