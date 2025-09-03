import React from 'react';

import { Box, Text, Radio, Title } from '@citizenlab/cl2-component-library';

interface Props {
  allow_anonymous_participation: boolean;
  onChange: () => void;
}

const DataCollection = ({ allow_anonymous_participation, onChange }: Props) => {
  return (
    <Box mt="32px">
      <Title variant="h4" color="primary">
        User data collection
      </Title>
      <Radio
        name="anonymous"
        value={false}
        currentValue={allow_anonymous_participation}
        label={
          <Text color="primary" m="0">
            <span style={{ fontWeight: 'bold' }}>
              Ask demographics and link user account:
            </span>{' '}
            ask users for demographics. Link response to user account.
          </Text>
        }
        onChange={onChange}
      />
      <Radio
        name="listed"
        value={true}
        currentValue={allow_anonymous_participation}
        label={
          <Text color="primary" m="0">
            <span style={{ fontWeight: 'bold' }}>Anonymous:</span> No user data
            will be collected. Responses will not be linked to user accounts.
          </Text>
        }
        onChange={onChange}
      />
    </Box>
  );
};

export default DataCollection;
