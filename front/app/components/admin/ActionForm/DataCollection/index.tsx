import React from 'react';

import { Box, Text, Radio, Title } from '@citizenlab/cl2-component-library';

import { PermittedBy } from 'api/phase_permissions/types';
import { Anonymity } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  anonymity: Anonymity;
  permitted_by: PermittedBy;
  onChange: (anonymity: Anonymity) => void;
}

const DataCollection = ({ anonymity, permitted_by, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box mt="32px">
      <Title variant="h4" color="primary">
        {formatMessage(messages.userDataCollection)}
      </Title>
      <Radio
        name="collect_all_data_available"
        value="collect_all_data_available"
        currentValue={anonymity}
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
        currentValue={anonymity}
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
        name="full_anonymity"
        value="full_anonymity"
        currentValue={anonymity}
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
