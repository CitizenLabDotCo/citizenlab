import React from 'react';

import IconButton from 'design-system/IconButton';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { useParticipationPanel } from './ParticipationPanelContext';

interface Props {
  variant: 'ghost' | 'bordered';
}

const PanelToggleButton = ({ variant }: Props) => {
  const { formatMessage } = useIntl();
  const { collapsed, setCollapsed } = useParticipationPanel();
  const label = formatMessage(
    collapsed ? messages.showPanel : messages.hidePanel
  );

  return variant === 'ghost' ? (
    <IconButton
      variant="ghost"
      icon="panel-left-16"
      aria-label={label}
      onPress={() => setCollapsed(!collapsed)}
    />
  ) : (
    <IconButton
      variant="bordered"
      icon="panel-left-16"
      aria-label={label}
      onPress={() => setCollapsed(!collapsed)}
    />
  );
};

export default PanelToggleButton;
