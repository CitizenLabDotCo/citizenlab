import React from 'react';

import {
  Box,
  Button,
  bo,
  colors,
  defaultStyles,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

export type EventView = 'build' | 'manage';

interface Props {
  activeView: EventView;
  onChange: (view: EventView) => void;
}

const EventViewSwitch = ({ activeView, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="inline-flex"
      gap="2px"
      p="3px"
      borderRadius={bo.borderRadius}
      background={colors.grey100}
      role="group"
      aria-label={formatMessage(messages.eventView)}
    >
      <Button
        buttonStyle="bo-text"
        type="button"
        width="auto"
        borderRadius={bo.borderRadius}
        boxShadow={activeView === 'build' ? defaultStyles.boxShadow : undefined}
        bgColor={activeView === 'build' ? colors.white : undefined}
        aria-pressed={activeView === 'build'}
        onClick={() => onChange('build')}
      >
        {formatMessage(messages.buildView)}
      </Button>
      <Button
        buttonStyle="bo-text"
        type="button"
        width="auto"
        borderRadius={bo.borderRadius}
        boxShadow={
          activeView === 'manage' ? defaultStyles.boxShadow : undefined
        }
        bgColor={activeView === 'manage' ? colors.white : undefined}
        aria-pressed={activeView === 'manage'}
        onClick={() => onChange('manage')}
      >
        {formatMessage(messages.manageView)}
      </Button>
    </Box>
  );
};

export default EventViewSwitch;
