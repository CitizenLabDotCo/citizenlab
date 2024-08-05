import React from 'react';

import { Box, Select, Title } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

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

  const handleUpdatePermissionsField = (option: IOption) => {
    // This 'persisted' attribute is used to determine whether
    // this field is 'real' and actually exists in our database.
    // By default, we get back a bunch of 'fake' fields from the API,
    // and only when we edit something for the first time will
    // we get the 'real' persisted ones.
    //
    // So on the first edit, when persisted is still false,
    // we also need to send the permission_id
    // and the custom_field_id, so that the backend can create
    // the 'real' persisted field.
    if (field.attributes.persisted) {
      updatePermissionsField({
        id: field.id,
        required: option.value === 'required',
      });
    } else {
      updatePermissionsField({
        id: field.id,
        permission_id: field.relationships.permission.data.id,
        custom_field_id: field.relationships.custom_field.data.id,
        required: option.value === 'required',
      });
    }
  };

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
          onChange={handleUpdatePermissionsField}
        />
      </Box>
    </Modal>
  );
};

export default CustomFieldModal;
