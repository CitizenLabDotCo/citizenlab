import React from 'react';

import { Box, Toggle, Text } from '@citizenlab/cl2-component-library';

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
      <Toggle
        checked={listed}
        label={
          <Text fontWeight="semi-bold" color="primary">
            {listed
              ? formatMessage(messages.listed)
              : formatMessage(messages.unlisted)}
          </Text>
        }
        onChange={onChange}
      />
      {listed ? (
        <Text mt="0" color="textSecondary">
          {formatMessage(messages.thisProjectWillBeListed)}
        </Text>
      ) : (
        <Text mt="0" color="textSecondary">
          {formatMessage(messages.thisProjectWillStayHidden)}
          <ul>
            <li>{formatMessage(messages.notVisible)}</li>
            <li>{formatMessage(messages.notIndexed)}</li>
            <li>{formatMessage(messages.emailNotifications)}</li>
            <li>{formatMessage(messages.onlyAccessible)}</li>
          </ul>
        </Text>
      )}
    </Box>
  );
};

export default ListingStatusToggle;
