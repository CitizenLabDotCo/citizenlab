import React from 'react';

import { Box, Select, Title } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import { IPermissionsFieldData } from 'api/permissions_fields/types';
import useUpdatePermissionsField from 'api/permissions_fields/useUpdatePermissionsField';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import parentMessages from '../messages';
import Tooltip from '../Tooltip';

import messages from './messages';

interface Props {
  field: IPermissionsFieldData;
  fieldName: string;
  phaseId: string;
  action: IPhasePermissionAction;
  opened: boolean;
  disableEditing: boolean;
  onClose: () => void;
}

const CustomFieldModal = ({
  field,
  fieldName,
  phaseId,
  action,
  opened,
  disableEditing,
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
        <Tooltip
          disabled={!disableEditing}
          placement="top"
          message={parentMessages.disableEditingExplanationFromModal}
        >
          <Select
            value={field.attributes.required ? 'required' : 'optional'}
            label={formatMessage(messages.fieldStatus)}
            options={options}
            disabled={disableEditing}
            onChange={(option) => {
              updatePermissionsField({
                id: field.id,
                required: option.value === 'required',
              });
            }}
          />
        </Tooltip>
      </Box>
    </Modal>
  );
};

export default CustomFieldModal;
