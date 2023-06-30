import React from 'react';

// components
import { Toggle, Box, IconTooltip } from '@citizenlab/cl2-component-library';

// intl
import messages from '../../messages';
import { useIntl } from 'utils/cl-intl';

const MultiselectSettings = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Toggle
        checked={false}
        onChange={() => {}}
        label={
          <Box>
            {formatMessage(messages.limitNumberAnswers)}
            <IconTooltip content="" />
          </Box>
        }
      />
    </>
  );
};

export default MultiselectSettings;
