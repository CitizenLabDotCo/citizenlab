import React, { useState } from 'react';

import { Title, Box, Button } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';

import { FieldSelectionModal } from 'components/admin/ActionsForm/UserFieldSelection/FieldSelectionModal';

import { FormattedMessage } from 'utils/cl-intl';

import CustomFields from './CustomFields';
import DefaultField from './DefaultField';
import messages from './messages';

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
}

const Fields = ({ phaseId, action }: Props) => {
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  return (
    <Box maxWidth="844px">
      <Title variant="h4" color="primary">
        <FormattedMessage {...messages.whatInformation} />
      </Title>
      <Box mt="20px">
        <DefaultField fieldName="Name" />
        <DefaultField fieldName="Email" />
        <CustomFields phaseId={phaseId} action={action} />
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
        <FieldSelectionModal
          showSelectionModal={showSelectionModal}
          setShowSelectionModal={setShowSelectionModal}
          selectedFields={[]} // TODO
          handleAddField={() => {}} // TODO
          isLoading={false} // TODO
        />
      </Box>
    </Box>
  );
};

export default Fields;
