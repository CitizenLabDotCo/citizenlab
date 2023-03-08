import { useState, useEffect } from 'react';

// services
import {
  usersByGenderStream,
  IUsersByRegistrationField,
} from 'services/userCustomFieldStats';

// i18n
import messages from 'containers/Admin/dashboard/messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { roundPercentages } from 'utils/math';

// typings
import { QueryParameters, GenderSerie } from './typings';
import { FormatMessage } from 'typings';

export default function useGenderSerie({
  startAt,
  endAt,
  currentGroupFilter,
  projectId,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [serie, setSerie] = useState<GenderSerie | NilOrError>();

  useEffect(() => {
    const { observable } = usersByGenderStream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        group: currentGroupFilter,
        project: projectId,
      },
    });

    const subscription = observable.subscribe(
      (response: IUsersByRegistrationField | NilOrError) => {
        if (isNilOrError(response)) {
          setSerie(response);
          return;
        }

        setSerie(convertToGraphFormat(response, formatMessage));
      }
    );

    return () => subscription.unsubscribe();
  }, [startAt, endAt, currentGroupFilter, projectId, formatMessage]);

  return serie;
}

const options = ['male', 'female', 'unspecified', '_blank'];

const convertToGraphFormat = (
  data: IUsersByRegistrationField,
  formatMessage: FormatMessage
): GenderSerie | null => {
  const { users } = data.data.attributes.series;

  const percentages = roundPercentages(options.map((gender) => users[gender]));
  const res = options.map((gender, i) => ({
    value: users[gender] || 0,
    name: formatMessage(messages[gender]),
    code: gender,
    percentage: percentages[i],
  }));
  return res.length > 0 ? res : null;
};
