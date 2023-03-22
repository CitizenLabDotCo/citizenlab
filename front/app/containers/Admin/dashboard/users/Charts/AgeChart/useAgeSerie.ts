import { useState, useEffect } from 'react';

// services
import {
  IUsersByBirthyear,
  usersByBirthyearStream,
} from 'services/userCustomFieldStats';

// i18n
import messages from 'containers/Admin/dashboard/messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { binBirthyear } from 'utils/dataUtils';

// typings
import { QueryParameters, AgeSerie } from './typings';
import { FormatMessage } from 'typings';

export default function useAgeSerie({
  startAt,
  endAt,
  currentGroupFilter,
  projectId,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [serie, setSerie] = useState<AgeSerie | NilOrError>();

  useEffect(() => {
    const { observable } = usersByBirthyearStream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        group: currentGroupFilter,
        project: projectId,
      },
    });

    const subscription = observable.subscribe(
      (response: IUsersByBirthyear | NilOrError) => {
        isNilOrError(response)
          ? setSerie(response)
          : setSerie(convertToGraphFormat(response, formatMessage));
      }
    );

    return () => subscription.unsubscribe();
  }, [startAt, endAt, currentGroupFilter, projectId, formatMessage]);

  return serie;
}

const convertToGraphFormat = (
  data: IUsersByBirthyear,
  formatMessage: FormatMessage
) => {
  if (isNilOrError(data)) return null;

  return binBirthyear(data.data.attributes.series.users, {
    missingBin: formatMessage(messages._blank),
  });
};
