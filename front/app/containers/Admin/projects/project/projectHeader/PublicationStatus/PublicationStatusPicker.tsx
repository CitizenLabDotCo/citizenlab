import React from 'react';

import { Radio, Text, Box } from '@citizenlab/cl2-component-library';

import { PublicationStatus } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  publicationStatus: PublicationStatus;
  handleStatusChange: (value: PublicationStatus) => void;
}

const PublicationStatusPicker = ({
  publicationStatus,
  handleStatusChange,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box p="8px" display="flex" flexDirection="column" gap="8px" pt="16px">
      <Radio
        onChange={handleStatusChange}
        currentValue={publicationStatus}
        value="draft"
        name="projectstatus"
        id="projectstatus-draft"
        className="e2e-projectstatus-draft"
        label={
          <Box display="flex" flexDirection="column">
            <span>{formatMessage(messages.draftStatus)}</span>
            <Text m="0px" color="textSecondary" fontSize="s">
              {formatMessage(messages.draftExplanation)}
            </Text>
          </Box>
        }
      />

      <Radio
        onChange={handleStatusChange}
        currentValue={publicationStatus}
        value="published"
        name="projectstatus"
        id="projectstatus-published"
        className="e2e-projectstatus-published"
        label={
          <Box display="flex" flexDirection="column">
            <span>{formatMessage(messages.publishedStatus)}</span>
            <Text m="0px" color="textSecondary" fontSize="s">
              {formatMessage(messages.publishedExplanation)}
            </Text>
          </Box>
        }
      />

      <Radio
        onChange={handleStatusChange}
        currentValue={publicationStatus}
        value="archived"
        name="projectstatus"
        id="projectstatus-archived"
        className="e2e-projectstatus-archived"
        label={
          <Box display="flex" flexDirection="column">
            <span>{formatMessage(messages.archivedStatus)}</span>
            <Text m="0px" color="textSecondary" fontSize="s">
              {formatMessage(messages.archivedExplanation)}
            </Text>
          </Box>
        }
      />
    </Box>
  );
};

export default PublicationStatusPicker;
