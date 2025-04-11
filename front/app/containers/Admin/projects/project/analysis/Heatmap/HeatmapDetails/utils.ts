import { colors } from '@citizenlab/cl2-component-library';

import { ICustomFieldBinData } from 'api/custom_field_bins/types';
import { ICustomFieldOption } from 'api/custom_field_options/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

export const getCellBgColor = (
  lift: number | undefined,
  isSignificant?: boolean
): string => {
  if (lift === undefined) return colors.grey200;
  if (lift >= 1.3 && isSignificant) return colors.success;
  if (lift >= 1) return colors.successLight;
  if (lift <= 0.7 && isSignificant) return colors.error;
  return colors.errorLight;
};

export const getCellTextColor = (
  lift: number | undefined,
  isSignificant?: boolean
): string => {
  if (lift === undefined) return colors.grey800;
  if (lift >= 1.3 && isSignificant) return colors.white;
  if (lift >= 1) return colors.grey800;
  if (lift <= 0.7 && isSignificant) return colors.white;
  return colors.grey800;
};

export const convertLiftToPercentage = (lift: number | undefined): string => {
  if (lift === undefined) return '';

  // Convert lift to percentage (relative to 1.0 which represents 0% change)
  const percentage = (lift - 1) * 100;

  // Format with sign and fixed decimal places
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(0)}%`;
};

export const formatRangeText = (
  range?: ICustomFieldBinData['attributes']['range']
) => {
  if (!range) return '';

  if (range.begin && range.end) {
    return `${range.begin} - ${range.end}`;
  } else if (range.begin) {
    return `> ${range.begin}`;
  } else if (range.end) {
    return `< ${range.end}`;
  }
  return '';
};

export const useGetOptionText = ({
  bin,
  option,
}: {
  bin: ICustomFieldBinData;
  option?: ICustomFieldOption;
}) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  switch (bin.attributes.type) {
    case 'CustomFieldBins::OptionBin':
      return localize(option?.data.attributes.title_multiloc);
    case 'CustomFieldBins::RangeBin':
      return formatRangeText(bin.attributes.range);

    case 'CustomFieldBins::AgeBin':
      return formatRangeText(bin.attributes.range);

    case 'CustomFieldBins::ValueBin': {
      const result = bin.attributes.values?.join(', ');
      if (result === 'true') {
        return formatMessage(messages.true);
      }
      if (result === 'false') {
        return formatMessage(messages.false);
      }
      return result;
    }
    default:
      return '';
  }
};
