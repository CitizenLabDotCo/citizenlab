import React, { useState } from 'react';

import {
  Box,
  IconButton,
  Text,
  colors,
  Tooltip,
  Button,
} from '@citizenlab/cl2-component-library';

import { Action } from 'api/permissions/types';
import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';
import useDeletePermissionsCustomField from 'api/permissions_custom_fields/useDeletePermissionsCustomField';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import CustomFieldModal from './CustomFieldModal';
import { getDescriptionMessage } from './utils';

interface Props {
  phaseId?: string;
  field: IPermissionsCustomFieldData;
  action: Action;
}

const CustomField = ({ field, phaseId, action }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: permissions } = usePhasePermissions({ phaseId });
  const globalCustomFieldsSetting =
    permissions?.data[0].attributes.global_custom_fields;
  // We check if globalCustomFieldsSetting is false to allow users who edited the fields before the feature flag was enforced to still access the functionality
  const isPermissionsCustomFieldsAllowed =
    useFeatureFlag({
      name: 'permissions_custom_fields',
      onlyCheckAllowed: true,
    }) || globalCustomFieldsSetting === false;

  const { mutate: deletePermissionsCustomField } =
    useDeletePermissionsCustomField({
      phaseId,
      action,
    });

  const fieldName = localize(field.attributes.title_multiloc);

  const disableEditAndDelete = field.attributes.lock === 'group';

  return (
    <>
      <Box
        w="100%"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box>
          <Text m="0" mt="4px" fontSize="m" color={'primary'}>
            {fieldName}
          </Text>
          <Text fontSize="s" m="0px" color={'grey800'}>
            {formatMessage(getDescriptionMessage(field))}
          </Text>
        </Box>
        {!disableEditAndDelete && (
          <Box display="flex">
            <Tooltip
              content={formatMessage(
                messages.contactGovSuccessToAccessAddingAQuestion
              )}
              disabled={isPermissionsCustomFieldsAllowed}
            >
              <Box>
                <Button
                  icon="edit"
                  buttonStyle="text"
                  p="0"
                  m="0"
                  mr="28px"
                  disabled={!isPermissionsCustomFieldsAllowed}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsModalOpen(true);
                  }}
                >
                  {formatMessage(messages.edit)}
                </Button>
              </Box>
            </Tooltip>
            <Tooltip
              content={formatMessage(
                messages.contactGovSuccessToAccessAddingAQuestion
              )}
              disabled={isPermissionsCustomFieldsAllowed}
            >
              <Box>
                <IconButton
                  iconName="delete"
                  iconColor={colors.grey700}
                  iconColorOnHover={colors.black}
                  iconWidth="20px"
                  mr="8px"
                  className="e2e-delete-custom-field"
                  a11y_buttonActionMessage={formatMessage(messages.removeField)}
                  disabled={!isPermissionsCustomFieldsAllowed}
                  onClick={(e) => {
                    e?.preventDefault();
                    deletePermissionsCustomField({
                      id: field.id,
                      permission_id: field.relationships.permission.data.id,
                      custom_field_id: field.relationships.custom_field.data.id,
                    });
                  }}
                />
              </Box>
            </Tooltip>
          </Box>
        )}
      </Box>
      <CustomFieldModal
        field={field}
        fieldName={fieldName}
        phaseId={phaseId}
        action={action}
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default CustomField;
