import React from 'react';

import { Button, Tooltip } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { useParticipationPanel } from './ParticipationPanelContext';

interface Props {
  buttonStyle: 'bo-text' | 'bo-secondary';
}

const PanelToggleButton = ({ buttonStyle }: Props) => {
  const { formatMessage } = useIntl();
  const { collapsed, setCollapsed } = useParticipationPanel();
  const label = formatMessage(
    collapsed ? messages.showPanel : messages.hidePanel
  );

  return (
    <Tooltip
      // A clicked tooltip stops opening on hover. The hide button stays
      // mounted while the panel is closed, so a toggle starts it over.
      key={String(collapsed)}
      content={label}
      theme="dark"
      placement={collapsed ? 'right' : 'bottom'}
      appendTo={() => document.body}
    >
      <Button
        buttonStyle={buttonStyle}
        icon="panel-left"
        width="32px"
        height="32px"
        padding="0"
        ariaLabel={label}
        onClick={() => setCollapsed(!collapsed)}
      />
    </Tooltip>
  );
};

export default PanelToggleButton;
