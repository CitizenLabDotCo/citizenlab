import React from 'react';

import { Box, Text, Radio } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  listed: boolean;
  onChange: () => void;
}

const ListingStatusToggle = ({ listed, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Radio
        name="public"
        value={true}
        currentValue={listed}
        label={
          <Box>
            <Text fontWeight="bold">{formatMessage(messages.public)}</Text>
            <Text>
              {formatMessage(messages.thisProjectIsVisibleToEveryone)}
            </Text>
          </Box>
        }
        onChange={onChange}
      />
      <Radio
        name="hidden"
        value={false}
        currentValue={listed}
        label={
          <Box>
            <Text fontWeight="bold">{formatMessage(messages.hidden)}</Text>
            <Text color="textSecondary">
              {formatMessage(messages.thisProjectWillBeHidden)}
              <ul>
                <li>{formatMessage(messages.notVisible)}</li>
                <li>{formatMessage(messages.notIndexed)}</li>
                <li>{formatMessage(messages.emailNotifications)}</li>
                <li>{formatMessage(messages.onlyAccessible)}</li>
              </ul>
            </Text>
          </Box>
        }
        onChange={onChange}
      />
    </Box>
  );
};

export default ListingStatusToggle;
