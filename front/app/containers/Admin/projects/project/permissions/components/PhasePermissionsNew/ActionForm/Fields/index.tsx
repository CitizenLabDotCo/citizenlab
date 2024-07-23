import React, { useState } from 'react';

import { Title, Box, Button } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import useAddPermissionsField from 'api/permissions_fields/useAddPermissionsField';
import usePermissionsFields from 'api/permissions_fields/usePermissionsFields';

import { FieldSelectionModal } from 'components/admin/ActionsForm/UserFieldSelection/FieldSelectionModal';

import { FormattedMessage } from 'utils/cl-intl';

import Tooltip from '../Tooltip';

import FieldsList from './FieldsList';
import messages from './messages';

interface Props {
  phaseId: string;
  disableEditing: boolean;
  action: IPhasePermissionAction;
}

const Fields = ({ phaseId, disableEditing, action }: Props) => {
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const { data: permissionFields } = usePermissionsFields({
    phaseId,
    action,
  });
  const { mutate: addPermissionsField, isLoading } = useAddPermissionsField({
    phaseId,
    action,
  });

  const selectedCustomFields = permissionFields?.data.filter(
    (field) => field.attributes.field_type === 'custom_field'
  );

  return (
    <Box maxWidth="844px">
      <Title variant="h4" color="primary">
        <FormattedMessage {...messages.extraQuestions} />
      </Title>
      <Box mt="20px">
        <FieldsList
          phaseId={phaseId}
          disableEditing={disableEditing}
          action={action}
        />
      </Box>
      <Box mt="20px" w="100%" display="flex">
        <Tooltip disabled={!disableEditing}>
          <Button
            buttonStyle="admin-dark"
            disabled={disableEditing}
            icon="plus-circle"
            onClick={(e) => {
              e.preventDefault();
              setShowSelectionModal(true);
            }}
          >
            <FormattedMessage {...messages.addAQuestion} />
          </Button>
        </Tooltip>
        {selectedCustomFields && (
          <FieldSelectionModal
            showSelectionModal={showSelectionModal}
            setShowSelectionModal={setShowSelectionModal}
            selectedFields={selectedCustomFields}
            handleAddField={(customField) => {
              addPermissionsField({
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
