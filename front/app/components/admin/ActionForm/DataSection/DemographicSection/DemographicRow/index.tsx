// A single demographic question row: its title, a required/optional select, and
// a remove button.

import React from 'react';

import { Box, Text, IconButton, colors, Select } from '@citizenlab/cl2-component-library';

import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  field: IPermissionsPhaseCustomFieldData;
  onChangeRequired: (required: boolean) => void;
  onRemove: () => void;
}

const DemographicRow = ({ field, onChangeRequired, onRemove }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const title = localize(field.attributes.title_multiloc);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px="10px"
      mb="4px"
      borderRadius="6px"
      bgColor={colors.grey50}
    >
      <Text as="span" m="0" fontSize="s" color="primary">
        {title}
      </Text>
      <Box display="flex" alignItems="center">
        <Box width="130px">
          <Select
            size="small"
            value={field.attributes.required ? 'required' : 'optional'}
            options={[
              { value: 'required', label: formatMessage(messages.required) },
              { value: 'optional', label: formatMessage(messages.optional) },
            ]}
            onChange={(option) => onChangeRequired(option.value === 'required')}
          />
        </Box>
        <IconButton
          iconName="delete"
          onClick={onRemove}
          a11y_buttonActionMessage={formatMessage(messages.removeDemographicField, { fieldName: title })}
          iconColor={colors.coolGrey500}
          iconColorOnHover={colors.red500}
          iconWidth="18px"
        />
      </Box>
    </Box>
  );
};

export default DemographicRow;
