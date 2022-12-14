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
} from 'services/userCustomFieldStats';

// components
import BarChartByCategory from './BarChartByCategory';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { binBirthyear } from 'utils/dataUtils';

interface Props {
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  className?: string;
  title?: string;
  showExportMenu?: boolean;
}

const AgeChart = (props: Props & WrappedComponentProps) => {
  const convertToGraphFormat = (data: IUsersByBirthyear) => {
    if (isNilOrError(data)) return null;

    return binBirthyear(data.series.users, {
      missingBin: props.intl.formatMessage(messages._blank),
    });
  };

  const cardTitle = props.title
    ? props.title
    : props.intl.formatMessage(messages.usersByAgeTitle);

  return (
    <BarChartByCategory
      {...props}
      graphTitleString={cardTitle}
      graphUnit="users"
      stream={usersByBirthyearStream}
      xlsxEndpoint={usersByBirthyearXlsxEndpoint}
      convertToGraphFormat={convertToGraphFormat}
    />
  );
};

export default injectIntl(AgeChart);
