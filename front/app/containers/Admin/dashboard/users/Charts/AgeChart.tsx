// Libraries
import React from 'react';
import { WrappedComponentProps } from 'react-intl';
// services
import {
  IUsersByBirthyear,
  usersByBirthyearStream,
  usersByBirthyearXlsxEndpoint,
} from 'services/userCustomFieldStats';
// i18n
import { injectIntl } from 'utils/cl-intl';
import { binBirthyear } from 'utils/dataUtils';
// utils
import { isNilOrError } from 'utils/helperUtils';
import messages from 'containers/Admin/dashboard/messages';
// components
import BarChartByCategory from './BarChartByCategory';

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
