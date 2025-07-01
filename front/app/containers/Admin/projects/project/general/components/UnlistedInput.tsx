import React from 'react';

import { Box, Toggle, Text } from '@citizenlab/cl2-component-library';

interface Props {
  listed: boolean;
  onChange: () => void;
}

const UnlistedInput = ({ listed, onChange }: Props) => {
  return (
    <Box>
      <Toggle
        checked={listed}
        label={
          <Text fontWeight="semi-bold" color="primary">
            {listed ? 'Listed' : 'Unlisted'}
          </Text>
        }
        onChange={onChange}
      />
      {listed ? (
        <Text mt="0" color="textSecondary">
          This project will be listed normally on the homepage and widgets.
        </Text>
      ) : (
        <Text mt="0" color="textSecondary">
          This project will stay hidden from the wider public unless you share
          the link.
          <ul>
            <li>Not visible on the homepage or widgets</li>
            <li>Not indexed by search engines</li>
            <li>Email notifications only sent to participants</li>
            <li>Only accessible via direct URL</li>
          </ul>
        </Text>
      )}
    </Box>
  );
};

export default UnlistedInput;
