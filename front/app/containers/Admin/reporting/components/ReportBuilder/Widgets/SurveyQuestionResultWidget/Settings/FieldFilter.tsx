import React from 'react';

// api
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';

// i18n
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';

// typings
import { IOption } from 'typings';

interface Props {
  phaseId: string;
  fieldId?: string;
  onFieldFilter: (fieldOption: IOption) => void;
}

const FieldFilter = ({ phaseId, fieldId, onFieldFilter }: Props) => {
  const { data: fields } = useRawCustomFields({ phaseId });
  const localize = useLocalize();

  const fieldOptions = fields
    ? fields.data.map((field) => ({
        value: field.id,
        label: localize(field.attributes.title_multiloc),
      }))
    : [];

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
