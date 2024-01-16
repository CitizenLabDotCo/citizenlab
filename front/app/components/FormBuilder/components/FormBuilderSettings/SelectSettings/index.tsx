import React from 'react';

// components
import { Box, IconTooltip } from '@citizenlab/cl2-component-library';
import Toggle from 'components/HookForm/Toggle';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  randomizeName: string;
};

const SelectSettings = ({
  randomizeName,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box mb="24px">
      <Toggle
        name={randomizeName}
        label={
          <Box display="flex">
            {formatMessage(messages.randomize)}
            <Box pl="4px">
              <IconTooltip
                placement="top-start"
                content={formatMessage(messages.randomizeToolTip)}
              />
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default SelectSettings;
