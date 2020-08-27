// Libraries
import React from 'react';
import { range, forOwn, get } from 'lodash-es';
import moment from 'moment';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// services
import {
  IUsersByBirthyear,
  usersByBirthyearStream,
  usersByBirthyearXlsxEndpoint,
} from 'services/stats';

// components
import BarChartByCategory from './BarChartByCategory';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  className?: string;
}

const AgeChart = (props: Props & InjectedIntlProps) => {
  const convertToGraphFormat = (data: IUsersByBirthyear) => {
    const currentYear = moment().year();

    if (!isNilOrError(data)) {
      return [
        ...range(0, 100, 10).map((minAge) => {
          let numberOfUsers = 0;
          const maxAge = minAge + 9;

          forOwn(data.series.users, (userCount, birthYear) => {
            const age = currentYear - parseInt(birthYear, 10);

            if (age >= minAge && age <= maxAge) {
              numberOfUsers += userCount;
            }
          });

          return {
            name: `${minAge} - ${maxAge}`,
            value: numberOfUsers,
            code: `${minAge}`,
          };
        }),
        {
          name: props.intl.formatMessage(messages._blank),
          value: get(data.series.users, '_blank', 0),
          code: '',
        },
      ];
    }

    return null;
  };

  return (
    <BarChartByCategory
      {...props}
      graphTitleString={props.intl.formatMessage(messages.usersByAgeTitle)}
      graphUnit="users"
      stream={usersByBirthyearStream}
      xlsxEndpoint={usersByBirthyearXlsxEndpoint}
      convertToGraphFormat={convertToGraphFormat}
    />
  );
};

export default injectIntl<Props>(AgeChart);
