import React from 'react';

import { Box, Select, Title } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import { Action } from 'api/permissions/types';
import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import useUpdatePermissionsPhaseCustomField from 'api/permissions_phase_custom_fields/useUpdatePermissionsPhaseCustomField';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  phaseId?: string;
  field: IPermissionsPhaseCustomFieldData;
  fieldName: string;
  action: Action;
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
  const { mutate: updatePermissionsCustomField } =
    useUpdatePermissionsPhaseCustomField({
      phaseId,
      action,
    });

  const handleUpdatePermissionsCustomField = (option: IOption) => {
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
      updatePermissionsCustomField({
        id: field.id,
        required: option.value === 'required',
      });
    } else {
      updatePermissionsCustomField({
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
          onChange={handleUpdatePermissionsCustomField}
        />
      </Box>
    </Modal>
  );
};

export default CustomFieldModal;
