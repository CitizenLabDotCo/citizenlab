import React, { useState } from 'react';

import {
  Box,
  Button,
  stylingConsts,
  Text,
  Toggle,
} from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import {
  IPermissionsFieldData,
  EmailConfig,
} from 'api/permissions_fields/types';
import useUpdatePermissionsField from 'api/permissions_fields/useUpdatePermissionsField';

import { useIntl } from 'utils/cl-intl';

import EmailModal from './EmailModal';
import messages from './messages';

interface Props {
  field: IPermissionsFieldData;
  phaseId: string;
  action: IPhasePermissionAction;
}

const getFieldNameMessage = (
  field_type: IPermissionsFieldData['attributes']['field_type']
) => {
  if (field_type === 'name') return messages.name;
  if (field_type === 'email') return messages.email;
  return undefined;
};

const isEmailConfig = (
  config: IPermissionsFieldData['attributes']['config']
): config is EmailConfig => {
  return 'password' in config && 'confirmed' in config;
};

const DefaultField = ({ field, phaseId, action }: Props) => {
  const { field_type, config, enabled } = field.attributes;

  const { formatMessage } = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: updatePermissionsField } = useUpdatePermissionsField({
    phaseId,
    action,
  });

  const fieldNameMessage = getFieldNameMessage(field_type);
  if (!fieldNameMessage) return null;

  return (
    <>
      <Box
        py="18px"
        borderTop={stylingConsts.border}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text m="0" fontSize="m" color="primary">
          {formatMessage(fieldNameMessage)}
        </Text>
        <Box display="flex" flexDirection="row">
          <Button
            icon="edit"
            buttonStyle="text"
            p="0"
            m="0"
            mr="22px"
            onClick={() => setIsModalOpen(true)}
          >
            {formatMessage(messages.edit)}
          </Button>
          <Box
            mb="-4px" // cancel out te bottom margin of the Toggle
          >
            <Toggle
              checked={enabled}
              onChange={() => {
                updatePermissionsField({
                  id: field.id,
                  enabled: !enabled,
                });
              }}
            />
          </Box>
        </Box>
      </Box>
      {field_type === 'email' && isEmailConfig(config) && (
        <EmailModal
          opened={isModalOpen}
          config={config}
          onClose={() => setIsModalOpen(false)}
          onUpdateConfig={(config) =>
            updatePermissionsField({
              id: field.id,
              config,
            })
          }
        />
      )}
    </>
  );
};

export default DefaultField;
