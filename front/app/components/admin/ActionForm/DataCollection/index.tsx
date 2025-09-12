import React from 'react';

import { Box, Text, Radio, Title } from '@citizenlab/cl2-component-library';

import { PermittedBy } from 'api/phase_permissions/types';
import { Anonymity } from 'api/phases/types';

interface Props {
  anonymity: Anonymity;
  permitted_by: PermittedBy;
  onChange: (anonymity: Anonymity) => void;
}

const DataCollection = ({ anonymity, permitted_by, onChange }: Props) => {
  return (
    <Box mt="32px">
      <Title variant="h4" color="primary">
        User data collection
      </Title>
      <Radio
        name="collect_all_data_available"
        value="collect_all_data_available"
        currentValue={anonymity}
        label={
          permitted_by === 'everyone' ? (
            <Text color="primary" m="0">
              <span style={{ fontWeight: 'bold' }}>
                Collect demographics and link user account:
              </span>{' '}
              collect demographics. Link response to user account if participant
              is logged in.
            </Text>
          ) : (
            <Text color="primary" m="0">
              <span style={{ fontWeight: 'bold' }}>
                Collect demographics and link user account:
              </span>{' '}
              collect demographics. Link response to user account.
            </Text>
          )
        }
        onChange={onChange}
      />
      <Radio
        name="demographics_only"
        value="demographics_only"
        currentValue={anonymity}
        label={
          <Text color="primary" m="0">
            <span style={{ fontWeight: 'bold' }}>Demographics only:</span>{' '}
            collect demographics. Responses will not be linked to user accounts.
          </Text>
        }
        onChange={onChange}
      />
      <Radio
        name="full_anonymity"
        value="full_anonymity"
        currentValue={anonymity}
        label={
          <Text color="primary" m="0">
            <span style={{ fontWeight: 'bold' }}>Full anonymity:</span> do not
            collect demographics. Responses will not be linked to user accounts.
          </Text>
        }
        onChange={onChange}
      />
    </Box>
  );
};

export default DataCollection;
