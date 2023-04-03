import React, { useState } from 'react';

// intl
import messages from '../../containers/Granular/messages';

// components
import {
  Title,
  Text,
  Button,
  Box,
  colors,
  Toggle,
} from '@citizenlab/cl2-component-library';
import { FieldSelectionModal } from './FieldSelectionModal';

// api
import useAddPermissionCustomField from 'api/permissions_custom_fields/useAddPermissionsCustomField';
import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';
import useDeletePermissionsCustomField from 'api/permissions_custom_fields/useDeletePermissionsCustomField';
import useUpdatePermissionsCustomField from 'api/permissions_custom_fields/useUpdatePermissionsCustomField';

// utils
import { FormattedMessage } from 'utils/cl-intl';
import FormattedMessageComponent from 'utils/cl-intl/FormattedMessage';

// services
import { IPermissionData } from 'services/actionPermissions';
import useUserCustomFields from 'hooks/useUserCustomFields';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import { IUserCustomFieldData } from 'services/userCustomFields';

type UserFieldSelectionProps = {
  permission: IPermissionData;
  projectId?: string | null;
  phaseId?: string | null;
  initiativeId?: string | null;
};

const UserFieldSelection = ({
  permission,
  projectId,
  phaseId,
  initiativeId,
}: UserFieldSelectionProps) => {
  const globalRegistrationFields = useUserCustomFields();
  const initialFields = usePermissionsCustomFields({
    projectId,
    phaseId,
    initiativeId,
    action: permission.attributes.action,
  });
  const { mutate: addPermissionCustomField } = useAddPermissionCustomField();
  const { mutate: updatePermissionCustomField } =
    useUpdatePermissionsCustomField();
  const { mutate: deletePermissionsCustomField } =
    useDeletePermissionsCustomField();
  const locale = useLocale();
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const initialFieldArray = initialFields?.data?.data;

  const handleAddField = (field: IUserCustomFieldData) => {
    addPermissionCustomField({
      custom_field_id: field.id,
      required: false,
      phaseId,
      initiativeId,
      projectId,
      action: permission.attributes.action,
    });
  };

  const handleDeleteField = (fieldId: string) => {
    deletePermissionsCustomField(fieldId);
  };

  if (isNilOrError(locale)) {
    return null;
  }

  return (
    <Box>
      <Title variant="h4" color="primary" style={{ fontWeight: 600 }}>
        <FormattedMessage {...messages.userQuestionTitle} />
      </Title>
      <Text fontSize="s" color="coolGrey600" pb="8px">
        <FormattedMessage {...messages.userFieldsSelectionDescription} />
      </Text>
      <Box>
        {initialFieldArray?.map((field) => (
          <Box
            display="flex"
            justifyContent="space-between"
            key={field.id}
            py="0px"
            borderTop="solid"
            borderWidth="1px"
            borderColor={colors.grey300}
          >
            <Text color="primary">
              {
                globalRegistrationFields?.find(
                  (globalField) =>
                    globalField.id === field.relationships.custom_field.data.id
                )?.attributes.title_multiloc[locale]
              }
            </Text>
            <Box display="flex">
              <Toggle
                checked={field.attributes.required}
                onChange={() => {
                  updatePermissionCustomField({
                    id: field.id,
                    required: !field.attributes.required,
                  });
                }}
                label={
                  <Text color="primary" fontSize="s">
                    <FormattedMessage {...messages.required} />
                  </Text>
                }
              />
              <Button
                buttonStyle="text"
                icon="delete"
                onClick={() => {
                  handleDeleteField(field.id);
                }}
              >
                <FormattedMessage {...messages.delete} />
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
      <Box display="flex" mt="12px">
        <Button
          icon="plus-circle"
          bgColor={colors.primary}
          onClick={() => {
            setShowSelectionModal(true);
          }}
        >
          <FormattedMessageComponent {...messages.addQuestion} />
        </Button>
      </Box>
      <FieldSelectionModal
        showSelectionModal={showSelectionModal}
        setShowSelectionModal={setShowSelectionModal}
        selectedFields={initialFieldArray}
        handleAddField={handleAddField}
        registrationFieldList={globalRegistrationFields}
        locale={locale}
      />
    </Box>
  );
};

export default UserFieldSelection;
