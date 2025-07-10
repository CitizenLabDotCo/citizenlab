import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import { IFile } from 'api/files/types';

type Props = {
  file: IFile;
};

const FileAnalysis = ({ file }: Props) => {
  return (
    <Box p="24px" background="white" borderRadius="8px">
      {/* AI Summary Section */}
      <Text fontSize="m">
        Other responses say they care about the governments initiatives and
        policies that directly impact their community. Some responses seem to
        show some kind of concern around how the government is responding to
        citizen-led feedback, as it may not be adequately addressed or taken
        into account.
      </Text>

      {/* Question Suggestion Card */}
      <Box
        p="16px"
        background="gray100"
        borderRadius="8px"
        display="flex"
        flexDirection="column"
        gap="12px"
      >
        <Text fontWeight="bold">
          What demographics are the least satisfied with service delivery in the
          Harlanda neighborhood?
        </Text>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text fontSize="s" color="textSecondary">
            341/11.284
          </Text>
          <Button icon="stars" size="s" buttonStyle="primary">
            Ask
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default FileAnalysis;
