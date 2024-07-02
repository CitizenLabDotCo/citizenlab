import React, { useState } from 'react';

import {
  Title,
  Text,
  Button,
  Box,
  colors,
  Toggle,
  IconTooltip,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { SupportedLocale } from 'typings';

import { IPermissionData } from 'api/permissions/types';
import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';
import useAddPermissionCustomField from 'api/permissions_custom_fields/useAddPermissionsCustomField';
import useDeletePermissionsCustomField from 'api/permissions_custom_fields/useDeletePermissionsCustomField';
import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';
import useUpdatePermissionsCustomField from 'api/permissions_custom_fields/useUpdatePermissionsCustomField';
import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import FormattedMessageComponent from 'utils/cl-intl/FormattedMessage';

import messages from './messages';
import { HandlePermissionChangeProps } from '../typings';

import { FieldSelectionModal } from './FieldSelectionModal';

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
  const { formatMessage } = useIntl();
  const permissionsCustomFieldsAllowed = useFeatureFlag({
    name: 'permissions_custom_fields',
    onlyCheckAllowed: true,
  });
  const { data: globalRegistrationFields } = useUserCustomFields();
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
    locale: SupportedLocale
  ) => {
    return globalRegistrationFields?.data.find(
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

  const showQuestionToggle =
    permission.attributes.permitted_by !== 'everyone_confirmed_email';

  const showQuestions =
    !permission.attributes.global_custom_fields ||
    permission.attributes.permitted_by === 'everyone_confirmed_email';

  return (
    <Tooltip
      placement={'bottom'}
      disabled={permissionsCustomFieldsAllowed}
      theme={'dark'}
      content={
        <Box style={{ cursor: 'default' }}>
          <Text my="8px" color="white" fontSize="s">
            {formatMessage(messages.premiumUsersOnly)}
          </Text>
        </Box>
      }
    >
      <Box>
        <Title
          variant="h4"
          color="primary"
          style={{ fontWeight: 600 }}
          mt="5px"
        >
          <FormattedMessage {...messages.userQuestionTitle} />
        </Title>
        <Text fontSize="s" color="coolGrey600" pb="8px">
          <FormattedMessage {...messages.userFieldsSelectionDescription} />
        </Text>

        <Box>
          {showQuestionToggle && (
            <Box mb="10px">
              <Toggle
                checked={permission.attributes.global_custom_fields}
                disabled={!permissionsCustomFieldsAllowed}
                onChange={() => {
                  onChange({
                    phaseId,
                    permission,
                    groupIds,
                    globalCustomFields:
                      !permission.attributes.global_custom_fields,
                  });
                }}
                label={
                  <Box display="flex">
                    <span
                      style={{
                        color: permissionsCustomFieldsAllowed
                          ? colors.primary
                          : colors.disabled,
                      }}
                    >
                      <FormattedMessage
                        {...messages.useExistingRegistrationQuestions}
                      />
                    </span>
                    {permissionsCustomFieldsAllowed && (
                      <IconTooltip
                        ml="4px"
                        icon="info-solid"
                        content={formatMessage(
                          messages.useExistingRegistrationQuestionsDescription
                        )}
                      />
                    )}
                  </Box>
                }
              />
            </Box>
          )}
          {showQuestions && (
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
                    <Text
                      style={{
                        color: permissionsCustomFieldsAllowed
                          ? colors.primary
                          : colors.disabled,
                      }}
                    >
                      {getTitleFromGlobalFieldId(field, locale)}
                    </Text>
                    <Box display="flex">
                      <Toggle
                        checked={field.attributes.required}
                        disabled={!permissionsCustomFieldsAllowed}
                        onChange={() => {
                          updatePermissionCustomField({
                            id: field.id,
                            required: !field.attributes.required,
                          });
                        }}
                        label={
                          <Text
                            fontSize="s"
                            color={
                              permissionsCustomFieldsAllowed
                                ? 'primary'
                                : 'disabled'
                            }
                          >
                            <FormattedMessage {...messages.required} />
                          </Text>
                        }
                      />
                      <Button
                        buttonStyle="text"
                        icon="delete"
                        disabled={!permissionsCustomFieldsAllowed}
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
                  disabled={!permissionsCustomFieldsAllowed}
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
                registrationFieldList={globalRegistrationFields?.data}
                locale={locale}
              />
            </>
          )}
        </Box>
      </Box>
    </Tooltip>
  );
};

export default UserFieldSelection;
