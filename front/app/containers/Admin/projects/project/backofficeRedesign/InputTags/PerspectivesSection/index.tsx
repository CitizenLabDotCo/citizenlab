import React from 'react';

import Switch from 'design-system/Switch';

import SettingsSection from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SettingsModal/SettingsSection';
import topicsMessages from 'containers/Admin/projects/project/topics/messages';

import { useIntl } from 'utils/cl-intl';
import 'design-system/tokens.css';

interface Props {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const PerspectivesSection = ({ enabled, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const title = formatMessage(topicsMessages.perspectives);

  return (
    <SettingsSection
      title={title}
      titleVariant="label"
      description={formatMessage(topicsMessages.liveAutoInputTopicsDescription)}
      action={
        <Switch
          size={36}
          aria-label={title}
          isSelected={enabled}
          onChange={onChange}
        />
      }
    />
  );
};

export default PerspectivesSection;
