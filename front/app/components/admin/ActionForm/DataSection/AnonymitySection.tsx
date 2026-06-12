// "Anonymity in results": how the collected data is linked to the submission.
// Only relevant when there's an account to link against.

import React from 'react';

import { Box, Text, Radio, Error } from '@citizenlab/cl2-component-library';

import {
  IPhasePermissionData,
  UserDataCollection,
} from 'api/phase_permissions/types';

import { DATA_COLLECTION_SUMMARY } from '../logic';
import { Changes } from '../types';
import { Expander } from '../ui';

const ANONYMITY_OPTIONS: {
  value: UserDataCollection;
  label: string;
  warning?: string;
}[] = [
  {
    value: 'all_data',
    label: 'Link submissions to the participant’s profile (recommended)',
  },
  {
    value: 'demographics_only',
    label: 'Keep demographics in results, but unlink personal info',
    warning:
      'Personal info will not be stored with submissions and cannot be recovered later.',
  },
  {
    value: 'anonymous',
    label: 'Fully anonymous — unlink personal info and demographics',
    warning:
      'Neither personal info nor demographics will be stored with submissions, and cannot be recovered later.',
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

  return (
    <Expander
      icon="shield-checkered"
      title="Anonymity in results"
      summary={DATA_COLLECTION_SUMMARY[attributes.user_data_collection]}
    >
      <Text as="p" mt="0" mb="10px" fontSize="xs" color="coolGrey600">
        Independent of what you ask above: you can collect a name yet still keep
        the submission unlinked from the participant’s profile.
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
                {option.label}
              </Text>
            }
          />
        </Box>
      ))}
      {activeWarning && <Error text={activeWarning} />}
    </Expander>
  );
};

export default AnonymitySection;
