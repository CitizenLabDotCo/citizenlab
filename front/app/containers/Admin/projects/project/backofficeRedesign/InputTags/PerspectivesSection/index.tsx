import React from 'react';

import topicsMessages from 'containers/Admin/projects/project/topics/messages';

import SettingToggleRow from 'components/admin/SettingToggleRow';

import { useIntl } from 'utils/cl-intl';

interface Props {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const PerspectivesSection = ({ enabled, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <SettingToggleRow
      title={formatMessage(topicsMessages.perspectives)}
      description={formatMessage(topicsMessages.liveAutoInputTopicsDescription)}
      checked={enabled}
      onChange={() => onChange(!enabled)}
    />
  );
};

export default PerspectivesSection;
