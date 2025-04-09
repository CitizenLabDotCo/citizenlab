import React from 'react';

import { Thead, Tr, Th } from '@citizenlab/cl2-component-library';

import { ICustomFieldBinData } from 'api/custom_field_bins/types';
import useCustomFieldBins from 'api/custom_field_bins/useCustomFieldBins';
import { ICustomFieldOptions } from 'api/custom_field_options/types';
import useCustomFieldsOptions from 'api/custom_field_options/useCustomFieldOptions';

import { useGetOptionText } from './utils';

interface CustomFieldOptionsProps {
  customFieldId: string;
}

const OptionTextTh = ({
  bin,
  options,
}: {
  bin: ICustomFieldBinData;
  options?: ICustomFieldOptions;
}) => {
  const optionText = useGetOptionText({
    bin,
    options,
  });

  return <Th>{optionText}</Th>;
};

const HeatmapTableHead: React.FC<CustomFieldOptionsProps> = ({
  customFieldId,
}) => {
  const { data: options } = useCustomFieldsOptions(customFieldId);
  const { data: bins } = useCustomFieldBins(customFieldId);

  return (
    <Thead>
      <Tr>
        <Th />
        {bins?.data.map((bin) => (
          <OptionTextTh key={bin.id} bin={bin} options={options} />
        ))}
      </Tr>
    </Thead>
  );
};

export default HeatmapTableHead;
