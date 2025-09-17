import React from 'react';

import { Box, Text, Radio, Title } from '@citizenlab/cl2-component-library';

import { PermittedBy, UserDataCollection } from 'api/phase_permissions/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  user_data_collection: UserDataCollection;
  permitted_by: PermittedBy;
  onChange: (user_data_collection: UserDataCollection) => void;
}

const DataCollection = ({
  user_data_collection,
  permitted_by,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box mt="32px">
      <Title variant="h4" color="primary">
        {formatMessage(messages.userDataCollection)}
      </Title>
      <Text>{formatMessage(messages.userDataCollectionDescription_users)}</Text>
      <Radio
        name="all_data"
        value="all_data"
        currentValue={user_data_collection}
        label={
          permitted_by === 'everyone' ? (
            <Text color="primary" m="0">
              <span style={{ fontWeight: 'bold' }}>
                {formatMessage(
                  messages.collectionDemographicsAndLinkUserAccount
                )}
              </span>
              {` ${formatMessage(messages.collectAndLink1)}`}
            </Text>
          ) : (
            <Text color="primary" m="0">
              <span style={{ fontWeight: 'bold' }}>
                {formatMessage(
                  messages.collectionDemographicsAndLinkUserAccount
                )}
              </span>
              {` ${formatMessage(messages.collectAndLink2)}`}
            </Text>
          )
        }
        onChange={onChange}
      />
      <Radio
        name="demographics_only"
        value="demographics_only"
        currentValue={user_data_collection}
        label={
          <Text color="primary" m="0">
            <span style={{ fontWeight: 'bold' }}>
              {formatMessage(messages.demographicsOnly)}
            </span>
            {` ${formatMessage(messages.collectAndNotLink)}`}
          </Text>
        }
        onChange={onChange}
      />
      <Radio
        name="anonymous"
        value="anonymous"
        currentValue={user_data_collection}
        label={
          <Text color="primary" m="0">
            <span style={{ fontWeight: 'bold' }}>
              {formatMessage(messages.fullAnonymity)}
            </span>
            {` ${formatMessage(messages.notCollectAndNotLink)}`}
          </Text>
        }
        onChange={onChange}
      />
    </Box>
  );
};

export default DataCollection;
