import React from 'react';

// api
// import useCustomFields from 'api/custom_fields/useCustomFields';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';

// typings
import { IOption } from 'typings';

interface Props {
  phaseId: string;
  fieldId?: string;
  onFieldFilter: (fieldOption: IOption) => void;
}

const FieldFilter = ({ fieldId, onFieldFilter }: Props) => {
  return (
    <Box width="100%" mb="20px">
      <Select
        label={'TODO'}
        value={fieldId}
        options={fieldOptions}
        onChange={onFieldFilter}
      />
    </Box>
  );
};

export default FieldFilter;
