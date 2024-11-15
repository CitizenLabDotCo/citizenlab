import React, { useState } from 'react';

import {
  Title,
  Box,
  Button,
  Tooltip,
  fontSizes,
} from '@citizenlab/cl2-component-library';

import { Action } from 'api/permissions/types';
import useAddPermissionsCustomField from 'api/permissions_custom_fields/useAddPermissionsCustomField';
import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import FieldSelectionModal from './FieldSelectionModal';
import FieldsList from './FieldsList';
import messages from './messages';

interface Props {
  phaseId?: string;
  action: Action;
  showAddQuestion: boolean;
}

const Fields = ({ phaseId, action, showAddQuestion }: Props) => {
  const { formatMessage } = useIntl();
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const { data: permissionFields } = usePermissionsCustomFields({
    phaseId,
    action,
  });
  const isPermissionsCustomFieldsAllowed = useFeatureFlag({
    name: 'permissions_custom_fields',
    onlyCheckAllowed: true,
  });
  const { mutate: addPermissionsCustomField, isLoading } =
    useAddPermissionsCustomField({
      phaseId,
      action,
    });

  const selectedCustomFields = permissionFields?.data;

  return (
    <Box maxWidth="844px">
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
      >
        <Title variant="h4" color="primary" mt="0px" mb="0px">
          <FormattedMessage {...messages.extraQuestions} />
        </Title>
        {showAddQuestion && (
          <Tooltip
            content={formatMessage(
              messages.contactGovSuccessToAccessAddingAQuestion
            )}
            disabled={isPermissionsCustomFieldsAllowed}
          >
            <Box>
              <Button
                buttonStyle="admin-dark"
                icon="plus-circle"
                iconSize={`${fontSizes.s}px`}
                fontSize={`${fontSizes.s}px`}
                padding="4px 8px"
                ml="16px"
                disabled={!isPermissionsCustomFieldsAllowed}
                onClick={(e) => {
                  e.preventDefault();
                  setShowSelectionModal(true);
                }}
              >
                <FormattedMessage {...messages.addAQuestion} />
              </Button>
            </Box>
          </Tooltip>
        )}
      </Box>
      <Box mt="20px">
        <FieldsList phaseId={phaseId} action={action} />
      </Box>
      {selectedCustomFields && (
        <FieldSelectionModal
          showSelectionModal={showSelectionModal}
          setShowSelectionModal={setShowSelectionModal}
          selectedFields={selectedCustomFields}
          handleAddField={(customField) => {
            addPermissionsCustomField({
              custom_field_id: customField.id,
              required: false,
              phaseId,
              action,
            });
          }}
          isLoading={isLoading}
        />
      )}
    </Box>
  );
};

export default Fields;
