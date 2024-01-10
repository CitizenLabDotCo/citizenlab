// i18n
import messages from 'containers/Admin/dashboard/messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { roundPercentages } from 'utils/math';

// typings
import { GenderSerie } from './typings';
import {
  GenderAggregation,
  GenderOption,
  IUsersByGender,
  genderOptions,
} from 'api/users_by_gender/types';

type GrouppedGenderAggregations = {
  [key in GenderOption]: number;
};

const convertAggregationsToObject = (aggregations: GenderAggregation[]) => {
  const initialValue: GrouppedGenderAggregations = {
    male: 0,
    female: 0,
    unspecified: 0,
    _blank: 0,
  };
  return aggregations.reduce((acc, aggregation) => {
    const genderValue: GenderOption =
      aggregation['dimension_user_custom_field_values.value'] || '_blank';
    const count =
      aggregation['count_dimension_user_custom_field_values_dimension_user_id'];
    acc[genderValue] = count;
    return acc;
  }, initialValue);
};

const useConvertToGraphFormat = (
  data: IUsersByGender | undefined
): GenderSerie | null => {
  const { formatMessage } = useIntl();

  if (!data) return null;
  const aggregations = data.data.attributes;
  const users = convertAggregationsToObject(aggregations);

  const percentages = roundPercentages(
    genderOptions.map((gender) => users[gender])
  );
  const res = genderOptions.map((gender, i) => ({
    value: users[gender],
    name: formatMessage(messages[gender]),
    code: gender,
    percentage: percentages[i],
  }));
  return res.length > 0 ? res : null;
};

export default useConvertToGraphFormat;
