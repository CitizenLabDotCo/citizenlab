import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  showDetails: boolean;
  setShowDetails: (showDetails: boolean) => void;
};

const DetailedViewButton = ({ showDetails, setShowDetails }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" justifyContent="center">
      <Button
        buttonStyle="text"
        icon={showDetails ? 'chevron-up' : 'chevron-down'}
        padding="0"
        mt="16px"
        onClick={() => {
          setShowDetails(!showDetails);
        }}
        text={
          showDetails
            ? formatMessage(messages.hideDetails)
            : formatMessage(messages.viewDetails)
        }
      />
    </Box>
  );
};

export default DetailedViewButton;
