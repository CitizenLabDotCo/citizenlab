import React, { useState } from 'react';

import { Title, Box, Button } from '@citizenlab/cl2-component-library';

import useAddPermissionsCustomField from 'api/permissions_custom_fields/useAddPermissionsCustomField';
import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';
import { IPhasePermissionAction } from 'api/phase_permissions/types';

import { FormattedMessage } from 'utils/cl-intl';

import FieldSelectionModal from './FieldSelectionModal';
import FieldsList from './FieldsList';
import messages from './messages';

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
}

const Fields = ({ phaseId, action }: Props) => {
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const { data: permissionFields } = usePermissionsCustomFields({
    phaseId,
    action,
  });
  const { mutate: addPermissionsCustomField, isLoading } =
    useAddPermissionsCustomField({
      phaseId,
      action,
    });

  const selectedCustomFields = permissionFields?.data;

  return (
    <Box maxWidth="844px">
      <Title variant="h4" color="primary">
        <FormattedMessage {...messages.extraQuestions} />
      </Title>
      <Box mt="20px">
        <FieldsList phaseId={phaseId} action={action} />
      </Box>
      <Box mt="20px" w="100%" display="flex">
        <Button
          buttonStyle="admin-dark"
          icon="plus-circle"
          onClick={(e) => {
            e.preventDefault();
            setShowSelectionModal(true);
          }}
        >
          <FormattedMessage {...messages.addAQuestion} />
        </Button>
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
    </Box>
  );
};

export default Fields;
