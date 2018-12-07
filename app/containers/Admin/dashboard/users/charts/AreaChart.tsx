// Libraries
import React from 'react';
import { map } from 'lodash-es';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import localize, { InjectedLocalized } from 'utils/localize';
import messages from '../../messages';

// services
import { IUsersByDomicile, usersByDomicileStream } from 'services/stats';

// components
import BarChartByCategory from './BarChartByCategory';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | null;
  className?: string;
}

const AreaChart = (props: Props & InjectedIntlProps & InjectedLocalized) => {
  const convertToGraphFormat = (data: IUsersByDomicile) => {
    if (!isNilOrError(data)) {
      const {
        series: {
          users
        },
        areas
      } = data;
      const {
        localize,
        intl: {
          formatMessage
        }
      } = props;
      const res = map(users, (value, key) => {
        return ({
          value,
          name: areas && areas[key]
            ? localize(areas[key].title_multiloc)
            : (key === '_blank'
              ? formatMessage(messages[key])
              : key
            ),
          code: key,
        });
      });

      return res.length > 0 ? res : null;
    }

    return null;
  };

  return (
    <BarChartByCategory
      {...props}
      graphTitleString={props.intl.formatMessage(messages.usersByDomicileTitle)}
      graphUnit="users"
      stream={usersByDomicileStream}
      convertToGraphFormat={convertToGraphFormat}
    />
  );
};

const WrappedAreaChart = injectIntl<Props>(localize<Props & InjectedIntlProps>(AreaChart));

export default WrappedAreaChart;
