import React from 'react';

import { Thead, Tr, Th } from '@citizenlab/cl2-component-library';

import { ICustomFieldBinData } from 'api/custom_field_bins/types';
import useCustomFieldBins from 'api/custom_field_bins/useCustomFieldBins';
import useCustomFieldOption from 'api/custom_field_options/useCustomFieldOption';

import { useGetOptionText } from './utils';

interface CustomFieldOptionsProps {
  customFieldId: string;
}

const OptionTextTh = ({ bin }: { bin: ICustomFieldBinData }) => {
  const { data: option } = useCustomFieldOption({
    optionId: bin.relationships.custom_field_option?.data?.id,
    enabled: !!bin.relationships.custom_field_option?.data?.id,
  });
  const optionText = useGetOptionText({
    bin,
    option,
  });

  return <Th>{optionText}</Th>;
};

const HeatmapTableHead: React.FC<CustomFieldOptionsProps> = ({
  customFieldId,
}) => {
  const { data: bins } = useCustomFieldBins(customFieldId);

  return (
    <Thead>
      <Tr>
        <Th />
        {bins?.data.map((bin) => (
          <OptionTextTh key={bin.id} bin={bin} />
        ))}
      </Tr>
    </Thead>
  );
};

export default HeatmapTableHead;
