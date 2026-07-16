// "Anonymity in results": how the collected data is linked to the submission.
// Only relevant when there's an account to link against.

import React from 'react';

import { Box, Text, Radio, Error } from '@citizenlab/cl2-component-library';

import {
  IPhasePermissionData,
  UserDataCollection,
} from 'api/phase_permissions/types';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { DATA_COLLECTION_SUMMARY } from '../../logic';
import { Changes } from '../../types';
import { Expander } from '../../ui';

import messages from './messages';

const ANONYMITY_OPTIONS: {
  value: UserDataCollection;
  label: MessageDescriptor;
  warning?: MessageDescriptor;
}[] = [
    {
      value: 'all_data',
      label: messages.allDataLabel,
    },
    {
      value: 'demographics_only',
      label: messages.demographicsOnlyLabel,
      warning: messages.demographicsOnlyWarning,
    },
    {
      value: 'anonymous',
      label: messages.anonymousLabel,
      warning: messages.anonymousWarning,
    },
  ];

interface Props {
  permission: IPhasePermissionData;
  onChange: (changes: Changes) => void;
}

const AnonymitySection = ({ permission, onChange }: Props) => {
  const { attributes } = permission;
  const activeWarning = ANONYMITY_OPTIONS.find(
    (o) => o.value === attributes.user_data_collection
  )?.warning;
  const { formatMessage } = useIntl();

  return (
    <Expander
      icon="shield-checkered"
      title={formatMessage(messages.anonymityInResults)}
      summary={formatMessage(DATA_COLLECTION_SUMMARY[attributes.user_data_collection])}
    >
      <Text as="p" mt="0" mb="10px" fontSize="xs" color="coolGrey600">
        {formatMessage(messages.anonymityExplanation)}
      </Text>
      {ANONYMITY_OPTIONS.map((option) => (
        <Box key={option.value} mb="4px">
          <Radio
            name="data-collection"
            value={option.value}
            currentValue={attributes.user_data_collection}
            onChange={(value: UserDataCollection) =>
              onChange({ user_data_collection: value })
            }
            label={
              <Text as="span" m="0" fontSize="s" color="primary">
                {formatMessage(option.label)}
              </Text>
            }
          />
        </Box>
      ))}
      {activeWarning && <Error text={formatMessage(activeWarning)} />}
    </Expander>
  );
};

export default AnonymitySection;
