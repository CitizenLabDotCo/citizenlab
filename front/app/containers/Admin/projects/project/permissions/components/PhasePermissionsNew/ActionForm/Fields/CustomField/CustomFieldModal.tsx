import React from 'react';

import { Box, Select, Title } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import { IPermissionsFieldData } from 'api/permissions_fields/types';
import useUpdatePermissionsField from 'api/permissions_fields/useUpdatePermissionsField';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  field: IPermissionsFieldData;
  fieldName: string;
  phaseId: string;
  action: IPhasePermissionAction;
  opened: boolean;
  onClose: () => void;
}

const CustomFieldModal = ({
  field,
  fieldName,
  phaseId,
  action,
  opened,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updatePermissionsField } = useUpdatePermissionsField({
    phaseId,
    action,
  });

  const options = [
    { value: 'required', label: formatMessage(messages.required) },
    { value: 'optional', label: formatMessage(messages.optional) },
  ];

  return (
    <Modal
      opened={opened}
      niceHeader
      header={
        <Title variant="h3" m="0" ml="32px">
          {formatMessage(messages.customFieldNameOptions, {
            customFieldName: fieldName,
          })}
        </Title>
      }
      close={onClose}
    >
      <Box p="32px">
        <Select
          value={field.attributes.required ? 'required' : 'optional'}
          label={formatMessage(messages.fieldStatus)}
          options={options}
          onChange={(option) => {
            updatePermissionsField({
              permission_id: field.id,
              required: option.value === 'required',
            });
          }}
        />
      </Box>
    </Modal>
  );
};

export default CustomFieldModal;
