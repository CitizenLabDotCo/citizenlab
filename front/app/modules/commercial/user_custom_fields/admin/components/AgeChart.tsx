// Libraries
import React from 'react';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from 'containers/Admin/dashboard/messages';

// services
import {
  IUsersByBirthyear,
  usersByBirthyearStream,
  usersByBirthyearXlsxEndpoint,
} from 'modules/commercial/user_custom_fields/services/stats';

// components
import BarChartByCategory from 'containers/Admin/dashboard/users/charts/BarChartByCategory';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { binBirthyear } from '../../utils/data';

interface Props {
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  className?: string;
}

const AgeChart = (props: Props & WrappedComponentProps) => {
  const convertToGraphFormat = (data: IUsersByBirthyear) => {
    if (isNilOrError(data)) return null;

    return binBirthyear(data.series.users, {
      missingBin: props.intl.formatMessage(messages._blank),
    });
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

export default injectIntl(AgeChart);
