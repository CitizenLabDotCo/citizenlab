// Libraries
import React from 'react';
import { map } from 'lodash-es';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import localize, { InjectedLocalized } from 'utils/localize';
import messages from '../../messages';

// services
import {
  IUsersByDomicile,
  usersByDomicileStream,
  usersByDomicileXlsxEndpoint,
} from 'services/stats';

// components
import HorizontalBarChart from './HorizontalBarChart';

// utils
import { isNilOrError } from 'utils/helperUtils';

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
    if (!isNilOrError(data)) {
      const { series, areas } = data;

      const res = map(areas, (value, key) => ({
        value: series.users[key],
        name: localize(value.title_multiloc),
        code: key,
      }));

      if (series.users['_blank']) {
        res.push({
          value: series.users['_blank'],
          name: formatMessage(messages._blank),
          code: '_blank',
        });
      }
      if (series.users['outside']) {
        res.push({
          value: series.users['outside'],
          name: formatMessage(messages.otherArea),
          code: 'outside',
        });
      }

      return res.length > 0 ? res : null;
    }

    return null;
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
