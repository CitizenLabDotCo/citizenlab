import React from 'react';

import { Thead, Tr, Th } from '@citizenlab/cl2-component-library';

import { ICustomFieldBinData } from 'api/custom_field_bins/types';
import useCustomFieldBins from 'api/custom_field_bins/useCustomFieldBins';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';

import useLocalize from 'hooks/useLocalize';

import { formatRangeText } from './utils';

interface CustomFieldOptionsProps {
  customFieldId: string;
}

const HeatmapTableHead: React.FC<CustomFieldOptionsProps> = ({
  customFieldId,
}) => {
  const { data: options } = useUserCustomFieldsOptions(customFieldId);
  const { data: bins } = useCustomFieldBins(customFieldId);
  const localize = useLocalize();

  const getOptionText = (bin: ICustomFieldBinData) => {
    switch (bin.attributes.type) {
      case 'CustomFieldBins::OptionBin':
        return localize(
          options?.data.find(
            (option) =>
              option.id === bin.relationships.custom_field_option?.data.id
          )?.attributes.title_multiloc
        );
      case 'CustomFieldBins::RangeBin':
        return formatRangeText(bin.attributes.range);

      case 'CustomFieldBins::AgeBin':
        return formatRangeText(bin.attributes.range);

      case 'CustomFieldBins::ValueBin':
        return bin.attributes.values?.join(', ');
      default:
        return '';
    }
  };

  return (
    <Thead>
      <Tr>
        <Th />
        {bins?.data.map((bin) => (
          <Th key={bin.id}>{getOptionText(bin)}</Th>
        ))}
      </Tr>
    </Thead>
  );
};

export default HeatmapTableHead;
