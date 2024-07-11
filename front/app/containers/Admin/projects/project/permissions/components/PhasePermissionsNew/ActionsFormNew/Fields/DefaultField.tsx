import React, { useState } from 'react';

import {
  Box,
  Button,
  stylingConsts,
  Text,
  Toggle,
} from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import { IPermissionsFieldData } from 'api/permissions_fields/types';
import useUpdatePermissionsField from 'api/permissions_fields/useUpdatePermissionsField';

import { useIntl } from 'utils/cl-intl';

import EmailModal from './EmailModal';
import messages from './messages';

interface Props {
  field: IPermissionsFieldData;
  phaseId: string;
  action: IPhasePermissionAction;
}

const getFieldNameMessage = (field: IPermissionsFieldData) => {
  if (field.attributes.field_type === 'name') return messages.name;
  if (field.attributes.field_type === 'email') return messages.email;
  return undefined;
};

const DefaultField = ({ field, phaseId, action }: Props) => {
  const { formatMessage } = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: updatePermissionsField } = useUpdatePermissionsField({
    phaseId,
    action,
  });

  const fieldNameMessage = getFieldNameMessage(field);

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
              checked={field.attributes.enabled}
              onChange={() => {
                updatePermissionsField({
                  id: field.id,
                  enabled: !field.attributes.enabled,
                });
              }}
            />
          </Box>
        </Box>
      </Box>
      <EmailModal opened={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default DefaultField;
