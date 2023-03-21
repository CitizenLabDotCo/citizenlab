import React, { useState } from 'react';

// intl
import messages from './messages';

// components
import {
  Title,
  Text,
  Button,
  Box,
  colors,
} from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';

// utils
import { FormattedMessage } from 'utils/cl-intl';
import FormattedMessageComponent from 'utils/cl-intl/FormattedMessage';

// services
import { IPermissionData } from 'services/actionPermissions';

type UserFieldSelectionProps = {
  permission: IPermissionData;
};

const UserFieldSelection = ({ permission }: UserFieldSelectionProps) => {
  console.log({ permission });
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  return (
    <Box>
      <Title variant="h4" color="primary" style={{ fontWeight: 600 }}>
        <FormattedMessage {...messages.userQuestionTitle} />
      </Title>
      <Text fontSize="s" color="coolGrey600" pb="8px">
        <FormattedMessage {...messages.userFieldsSelectionDescription} />
      </Text>
      <Box display="flex">
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
      <Modal
        opened={showSelectionModal}
        close={() => {
          setShowSelectionModal(false);
        }}
      >
        <Box display="flex" flexDirection="column" width="100%">
          <Box mb="40px">
            <Title variant="h3" color="primary">
              <FormattedMessageComponent {...messages.addQuestion} />
            </Title>
            <Text color="primary" fontSize="l">
              User Custom Fields List
            </Text>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default UserFieldSelection;
