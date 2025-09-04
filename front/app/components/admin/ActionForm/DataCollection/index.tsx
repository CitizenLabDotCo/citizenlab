import React from 'react';

import { Box, Text, Radio, Title } from '@citizenlab/cl2-component-library';

import { PermittedBy } from 'api/phase_permissions/types';

interface Props {
  allow_anonymous_participation: boolean;
  permitted_by: PermittedBy;
  onChange: () => void;
}

const DataCollection = ({
  allow_anonymous_participation,
  permitted_by,
  onChange,
}: Props) => {
  return (
    <Box mt="32px">
      <Title variant="h4" color="primary">
        User data collection
      </Title>
      <Radio
        name="ask-demographics-and-link-user-account"
        value={false}
        currentValue={allow_anonymous_participation}
        label={
          permitted_by === 'everyone' ? (
            <Text color="primary" m="0">
              <span style={{ fontWeight: 'bold' }}>
                Ask demographics and link user account:
              </span>{' '}
              ask participants for demographics. Link response to user account
              if participant is logged in.
            </Text>
          ) : (
            <Text color="primary" m="0">
              <span style={{ fontWeight: 'bold' }}>
                Ask demographics and link user account:
              </span>{' '}
              ask users for demographics. Link response to user account.
            </Text>
          )
        }
        onChange={onChange}
      />
      <Radio
        name="anonymous"
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
