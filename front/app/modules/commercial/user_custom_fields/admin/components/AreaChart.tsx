// Libraries
import React from 'react';
import { orderBy } from 'lodash-es';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import localize, { InjectedLocalized } from 'utils/localize';
import messages from 'containers/Admin/dashboard/messages';

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

const AreaChart = (props: Props & InjectedIntlProps & InjectedLocalized) => {
  const {
    intl: { formatMessage },
    localize,
  } = props;

  const convertToGraphFormat = (data: IUsersByDomicile) => {
    if (isNilOrError(data)) return null;

    const { series, areas } = data;

    const defaultMessages = {
      _blank: formatMessage(messages._blank),
      outside: formatMessage(messages.otherArea),
    };

    const parseName = (key, value) =>
      key in defaultMessages
        ? defaultMessages[key]
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

const WrappedAreaChart = injectIntl<Props>(
  localize<Props & InjectedIntlProps>(AreaChart)
);

export default WrappedAreaChart;
