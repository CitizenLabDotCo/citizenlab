// A single demographic question row: its title, a required/optional select, and
// a remove button.

import React from 'react';

import { Box, Text, Select, IconButton, colors } from '@citizenlab/cl2-component-library';

import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';

import useLocalize from 'hooks/useLocalize';

interface Props {
  field: IPermissionsPhaseCustomFieldData;
  onChangeRequired: (required: boolean) => void;
  onRemove: () => void;
}

const DemographicRow = ({ field, onChangeRequired, onRemove }: Props) => {
  const localize = useLocalize();
  const title = localize(field.attributes.title_multiloc);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="8px"
      py="6px"
      px="10px"
      mb="4px"
      borderRadius="6px"
      bgColor={colors.grey50}
    >
      <Text as="span" m="0" fontSize="s" color="primary">
        {title}
      </Text>
      <Box display="flex" alignItems="center" gap="4px">
        <Box width="130px">
          <Select
            size="small"
            value={field.attributes.required ? 'required' : 'optional'}
            options={[
              { value: 'required', label: 'Required' },
              { value: 'optional', label: 'Optional' },
            ]}
            onChange={(option) => onChangeRequired(option.value === 'required')}
          />
        </Box>
        <IconButton
          iconName="delete"
          onClick={onRemove}
          a11y_buttonActionMessage={`Remove ${title}`}
          iconColor={colors.coolGrey500}
          iconColorOnHover={colors.red500}
          iconWidth="18px"
        />
      </Box>
    </Box>
  );
};

export default DemographicRow;
