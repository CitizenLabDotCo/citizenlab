import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  url: string;
};

const DownloadFileButton = ({ url }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Box display="flex">
      <Button
        mt="12px"
        buttonStyle="admin-dark"
        onClick={() => window.open(url, '_blank')}
        text={formatMessage(messages.downloadFile)}
        fontSize="s"
        p="4px 8px"
      />
    </Box>
  );
};

export default DownloadFileButton;
