import React from 'react';

import { Toggle } from '@citizenlab/cl2-component-library';

import { IUpdatedProjectProperties } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import { StyledSectionField } from './styling';

interface Props {
  checked: boolean;
  onChange: (diff: IUpdatedProjectProperties) => void;
}

const ParticipationDeviceToggle = ({ checked, onChange }: Props) => {
  const isFeatureActive = useFeatureFlag({
    name: 'participation_device_tracking',
  });

  if (!isFeatureActive) return null;

  return (
    <StyledSectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.participationDeviceTitle} />
      </SubSectionTitle>
      <Toggle
        checked={checked}
        onChange={() => onChange({ track_participation_device: !checked })}
        label={<FormattedMessage {...messages.participationDeviceLabel} />}
      />
    </StyledSectionField>
  );
};

export default ParticipationDeviceToggle;
