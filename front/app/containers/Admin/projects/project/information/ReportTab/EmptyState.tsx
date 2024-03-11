import React, { useState } from 'react';

import { Text, Box, Button, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import CreateReportModal from './CreateReportModal';
import messages from './messages';

interface Props {
  projectId: string;
  phaseId: string;
}

const EmptyState = ({ projectId, phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const [modalOpened, setModalOpened] = useState<boolean>(false);

  return (
    <>
      <Text color="textSecondary">
        {formatMessage(messages.createAReportTo)}
      </Text>
      <ul>
        <li>
          <Text m="0" color="textSecondary">
            {formatMessage(messages.shareResults)}
          </Text>
        </li>
        <li>
          <Text m="0" color="textSecondary">
            {formatMessage(messages.createAMoreComplex)}
          </Text>
        </li>
      </ul>
      <Text color="textSecondary">{formatMessage(messages.afterCreating)}</Text>
      <Box w="100%" mt="32px" display="flex">
        <Button
          id="e2e-create-report-button"
          icon="reports"
          bgColor={colors.primary}
          width="auto"
          onClick={() => {
            setModalOpened(true);
          }}
        >
          {formatMessage(messages.createReport)}
        </Button>
      </Box>
      <CreateReportModal
        projectId={projectId}
        phaseId={phaseId}
        open={modalOpened}
        onClose={() => {
          setModalOpened(false);
        }}
      />
    </>
  );
};

export default EmptyState;
