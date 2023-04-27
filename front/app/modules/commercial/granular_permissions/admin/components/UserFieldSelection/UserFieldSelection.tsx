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
  Locale,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { FieldSelectionModal } from './FieldSelectionModal';
import Tippy from '@tippyjs/react';

// api
import useAddPermissionCustomField from 'api/permissions_custom_fields/useAddPermissionsCustomField';
import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';
import useDeletePermissionsCustomField from 'api/permissions_custom_fields/useDeletePermissionsCustomField';
import useUpdatePermissionsCustomField from 'api/permissions_custom_fields/useUpdatePermissionsCustomField';

// utils
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import FormattedMessageComponent from 'utils/cl-intl/FormattedMessage';
import { isNilOrError } from 'utils/helperUtils';

// services
import { IPermissionData } from 'services/actionPermissions';
import { IUserCustomFieldData } from 'services/userCustomFields';
import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';
import { HandlePermissionChangeProps } from '../../containers/Granular/utils';
import { isAdmin } from 'services/permissions/roles';

// hooks
import useUserCustomFields from 'hooks/useUserCustomFields';
import useLocale from 'hooks/useLocale';
import useAuthUser from 'hooks/useAuthUser';

type UserFieldSelectionProps = {
  permission: IPermissionData;
  projectId?: string | null;
  phaseId?: string | null;
  initiativeContext?: boolean;
  onChange: ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => void;
};

const UserFieldSelection = ({
  permission,
  projectId,
  phaseId,
  initiativeContext,
  onChange,
}: UserFieldSelectionProps) => {
  const authUser = useAuthUser();
  const { formatMessage } = useIntl();
  // const permissionsCustomFieldsEnabled = useFeatureFlag({
  //   name: 'permissions_custom_fields',
  // });
  const permissionsCustomFieldsEnabled = false;
  const globalRegistrationFields = useUserCustomFields();
  const initialFields = usePermissionsCustomFields({
    projectId,
    phaseId,
    initiativeContext,
    action: permission.attributes.action,
  });
  const { mutate: addPermissionCustomField, isLoading } =
    useAddPermissionCustomField({
      phaseId,
      projectId,
      initiativeContext,
      action: permission.attributes.action,
    });
  const { mutate: updatePermissionCustomField } =
    useUpdatePermissionsCustomField({
      projectId,
      phaseId,
      initiativeContext,
      action: permission.attributes.action,
    });
  const { mutate: deletePermissionsCustomField } =
    useDeletePermissionsCustomField({
      projectId,
      phaseId,
      initiativeContext,
      action: permission.attributes.action,
    });

  const locale = useLocale();
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const initialFieldArray = initialFields?.data?.data;

  const getTitleFromGlobalFieldId = (
    field: IPermissionsCustomFieldData,
    locale: Locale
  ) => {
    return globalRegistrationFields?.find(
      (globalField) =>
        globalField.id === field?.relationships?.custom_field?.data.id
    )?.attributes.title_multiloc[locale];
  };

  const handleAddField = (field: IUserCustomFieldData) => {
    addPermissionCustomField({
      custom_field_id: field.id,
      required: false,
      phaseId,
      initiativeContext,
      projectId,
      action: permission.attributes.action,
    });
  };

  const handleDeleteField = (fieldId: string) => {
    deletePermissionsCustomField(fieldId);
  };

  const groupIds = permission.relationships.groups.data.map((p) => p.id);

  if (isNilOrError(locale) || isNilOrError(authUser)) {
    return null;
  }

  const userIsAdmin = authUser && isAdmin({ data: authUser });

  const showQuestionToggle =
    permission.attributes.permitted_by !== 'everyone_confirmed_email';

  const showQuestions =
    !permission.attributes.global_custom_fields ||
    permission.attributes.permitted_by === 'everyone_confirmed_email';

  const toggleDisabled = !userIsAdmin || !permissionsCustomFieldsEnabled;
  const toggleDisabledMessage = !permissionsCustomFieldsEnabled
    ? messages.premiumUsersOnly
    : messages.onlyAdmins;

  const fieldsDisabled = !permissionsCustomFieldsEnabled;
  const fieldsDisabledMessage = messages.premiumUsersOnly;

  return (
    <Box>
      <Title variant="h4" color="primary" style={{ fontWeight: 600 }}>
        <FormattedMessage {...messages.userQuestionTitle} />
      </Title>
      <Text fontSize="s" color="coolGrey600" pb="8px">
        <FormattedMessage {...messages.userFieldsSelectionDescription} />
      </Text>

      <Box>
        {showQuestionToggle && (
          <Tippy
            interactive={true}
            placement={'right-end'}
            disabled={!toggleDisabled}
            theme={'dark'}
            content={
              <Box style={{ cursor: 'default' }}>
                <Text my="8px" color="white" fontSize="s">
                  {formatMessage(toggleDisabledMessage)}
                </Text>
              </Box>
            }
          >
            <Box mb="10px">
              <Toggle
                checked={permission.attributes.global_custom_fields}
                disabled={toggleDisabled}
                onChange={() => {
                  onChange({
                    permission,
                    groupIds,
                    globalCustomFields:
                      !permission.attributes.global_custom_fields,
                  });
                }}
                label={
                  <Box display="flex">
                    <span style={{ color: colors.primary }}>
                      <FormattedMessage
                        {...messages.useExistingRegistrationQuestions}
                      />
                    </span>

                    <IconTooltip
                      ml="4px"
                      icon="info-solid"
                      content={formatMessage(
                        toggleDisabled
                          ? toggleDisabledMessage
                          : messages.useExistingRegistrationQuestionsDescription
                      )}
                    />
                  </Box>
                }
              />
            </Box>
          </Tippy>
        )}
        {showQuestions && (
          <Tippy
            interactive={true}
            placement={'right-end'}
            disabled={fieldsDisabled}
            theme={'dark'}
            content={
              <Box style={{ cursor: 'default' }}>
                <Text my="8px" color="white" fontSize="s">
                  {formatMessage(fieldsDisabledMessage)}
                </Text>
              </Box>
            }
          >
            <>
              <Box mt="20px">
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
                      {getTitleFromGlobalFieldId(field, locale)}
                    </Text>
                    <Box display="flex">
                      <Toggle
                        checked={field.attributes.required}
                        disabled={fieldsDisabled}
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
                        disabled={fieldsDisabled}
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
                  disabled={fieldsDisabled}
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
                isLoading={isLoading}
                registrationFieldList={globalRegistrationFields}
                locale={locale}
              />
            </>
          </Tippy>
        )}
      </Box>
    </Box>
  );
};

export default UserFieldSelection;
