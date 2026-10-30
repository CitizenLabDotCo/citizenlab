import React, { useId } from 'react';

import { Box, Toggle } from '@citizenlab/cl2-component-library';

import SettingsSection from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SettingsModal/SettingsSection';
import topicsMessages from 'containers/Admin/projects/project/topics/messages';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

interface Props {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const PerspectivesSection = ({ enabled, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const toggleId = useId();

  const title = formatMessage(topicsMessages.perspectives);

  return (
    <SettingsSection
      title={title}
      titleVariant="label"
      description={formatMessage(topicsMessages.liveAutoInputTopicsDescription)}
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

export default PerspectivesSection;
