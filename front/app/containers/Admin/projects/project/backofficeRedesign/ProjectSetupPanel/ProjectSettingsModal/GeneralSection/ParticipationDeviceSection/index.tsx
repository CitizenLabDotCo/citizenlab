import React, { useId } from 'react';

import { Box, Toggle } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import projectSetupMessages from 'containers/Admin/projects/_shared/components/ProjectSetupForm/messages';
import SettingsSection from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SettingsModal/SettingsSection';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

interface Props {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const ParticipationDeviceSection = ({ enabled, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const toggleId = useId();
  const isFeatureActive = useFeatureFlag({
    name: 'participation_device_tracking',
  });

  if (!isFeatureActive) return null;

  const title = formatMessage(projectSetupMessages.participationDeviceTitle);

  return (
    <SettingsSection
      title={title}
      description={formatMessage(projectSetupMessages.participationDeviceLabel)}
      action={
        <Box>
          <label htmlFor={toggleId}>
            <ScreenReaderOnly>{title}</ScreenReaderOnly>
          </label>
          <Toggle
            id={toggleId}
            size="small"
            checked={enabled}
            onChange={() => onChange(!enabled)}
          />
        </Box>
      }
    />
  );
};

export default ParticipationDeviceSection;
