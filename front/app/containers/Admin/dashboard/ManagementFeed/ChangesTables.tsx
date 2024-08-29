import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import ChangesTable from './ChangesTable';
import messages from './messages';

const ChangesTablesBeforeAndAfter = ({
  changes,
}: {
  changes: Record<string, any[]> | null;
}) => {
  const { formatMessage } = useIntl();

  if (!changes) {
    return null;
  }
  const keys = Object.keys(changes);

  const beforeChanges = keys.reduce((acc, key) => {
    if (changes[key][0]) {
      acc[key] = changes[key][0];
    }
    return acc;
  }, {});

  const afterChanges = keys.reduce((acc, key) => {
    if (changes[key][1]) {
      acc[key] = changes[key][1];
    }
    return acc;
  }, {});

  return (
    <div>
      <Box display="flex" gap="8px">
        <Box flex="1">
          <Title color="primary" variant="h2">
            {formatMessage(messages.before)}
          </Title>
          <ChangesTable changes={beforeChanges} />
        </Box>
        <Box flex="1">
          <Title color="primary" variant="h2">
            {formatMessage(messages.after)}
          </Title>
          <ChangesTable changes={afterChanges} />
        </Box>
      </Box>
    </div>
  );
};

export default ChangesTablesBeforeAndAfter;
