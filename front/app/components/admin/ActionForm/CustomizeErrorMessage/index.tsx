import React, { useState } from 'react';

import {
  Box,
  Title,
  Button,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { FormattedMessage } from 'utils/cl-intl';

import ErrorMessageModal from './ErrorMessageModal';
import messages from './messages';

interface Props {
  access_denied_explanation_multiloc: Multiloc;
  onUpdate: (access_denied_explanation_multiloc?: Multiloc) => Promise<void>;
}

const CustomizeErrorMessage = ({
  access_denied_explanation_multiloc,
  onUpdate,
}: Props) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Box mt="4px">
        <Box display="flex" flexDirection="row" alignItems="center">
          <Title variant="h4" color="primary">
            <FormattedMessage {...messages.errorMessage} />
          </Title>
          <IconTooltip
            ml="4px"
            transform="translate(0,4px)"
            content={<FormattedMessage {...messages.errorMessageTooltip} />}
          />
        </Box>
        <Box display="flex">
          <Button
            buttonStyle="admin-dark"
            w="auto"
            onClick={(e) => {
              e.preventDefault();
              setModalOpen(true);
            }}
          >
            <FormattedMessage {...messages.customizeErrorMessage} />
          </Button>
        </Box>
      </Box>
      <ErrorMessageModal
        opened={modalOpen}
        access_denied_explanation_multiloc={access_denied_explanation_multiloc}
        onClose={() => setModalOpen(false)}
        onSubmit={async ({ access_denied_explanation_multiloc }) => {
          await onUpdate(access_denied_explanation_multiloc);
        }}
      />
    </>
  );
};

export default CustomizeErrorMessage;
