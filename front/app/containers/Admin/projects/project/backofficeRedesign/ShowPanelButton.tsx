import React from 'react';

import { Button, Tooltip } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  buttonStyle: 'bo-text' | 'bo-secondary';
  onClick: () => void;
}

const ShowPanelButton = ({ buttonStyle, onClick }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Tooltip
      content={formatMessage(messages.showPanel)}
      theme="dark"
      placement="right"
      appendTo={() => document.body}
    >
      <Button
        buttonStyle={buttonStyle}
        icon="panel-left"
        width="32px"
        height="32px"
        padding="0"
        ariaLabel={formatMessage(messages.showPanel)}
        onClick={onClick}
      />
    </Tooltip>
  );
};

export default ShowPanelButton;
