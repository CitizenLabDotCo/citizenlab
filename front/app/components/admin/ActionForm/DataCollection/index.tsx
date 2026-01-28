import React from 'react';

import {
  Box,
  Text,
  Radio,
  Title,
  IconTooltip,
  Error,
} from '@citizenlab/cl2-component-library';

import { UserDataCollection } from 'api/phase_permissions/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  user_data_collection: UserDataCollection;
  onChange: (user_data_collection: UserDataCollection) => void;
}

const DataCollection = ({ user_data_collection, onChange }: Props) => {
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
          <Text color="primary" m="0">
            {formatMessage(messages.includePersonalDataAndDemographics)}
          </Text>
        }
        onChange={onChange}
      />
      <Radio
        name="demographics_only"
        value="demographics_only"
        currentValue={user_data_collection}
        label={
          <Box display="flex" alignItems="center">
            <Text color="primary" m="0">
              {formatMessage(
                messages.excludePersonalDataButIncludeDemographics
              )}
            </Text>
            <IconTooltip ml="4px" content={formatMessage(messages.tooltip)} />
          </Box>
        }
        onChange={onChange}
      />
      <Radio
        name="anonymous"
        value="anonymous"
        currentValue={user_data_collection}
        label={
          <Box display="flex" alignItems="center">
            <Text color="primary" m="0">
              {formatMessage(messages.excludePersonalDataAndDemographics)}
            </Text>
            <IconTooltip ml="4px" content={formatMessage(messages.tooltip)} />
          </Box>
        }
        onChange={onChange}
      />
      {user_data_collection === 'demographics_only' && (
        <Error text={formatMessage(messages.demographicsOnlyWarning)} />
      )}
      {user_data_collection === 'anonymous' && (
        <Error text={formatMessage(messages.anonymousWarning)} />
      )}
    </Box>
  );
};

export default DataCollection;
