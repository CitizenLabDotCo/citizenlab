import React from 'react';

import ToggleButton from 'design-system/ToggleButton';
import ToggleButtonGroup from 'design-system/ToggleButtonGroup';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

export type InputDisplay = 'list' | 'map';

interface Props {
  display: InputDisplay;
  onChange: (display: InputDisplay) => void;
}

const InputDisplayToggle = ({ display, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <ToggleButtonGroup
      aria-label={formatMessage(messages.inputDisplay)}
      selectedKeys={[display]}
      onSelectionChange={(keys) => onChange(keys.has('map') ? 'map' : 'list')}
    >
      <ToggleButton id="list">
        {formatMessage(messages.listDisplay)}
      </ToggleButton>
      <ToggleButton id="map">{formatMessage(messages.mapDisplay)}</ToggleButton>
    </ToggleButtonGroup>
  );
};

export default InputDisplayToggle;
