// Libraries
import React from 'react';

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
import { convertDomicileData, AreaValue } from '../../utils/data';

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

    const parseName = (key: string, value?: AreaValue) =>
      key in defaultMessages
        ? defaultMessages[key]
        : localize(value && value.title_multiloc);

    return convertDomicileData(areas, series.users, parseName);
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
