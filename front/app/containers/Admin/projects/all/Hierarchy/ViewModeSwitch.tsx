import React from 'react';

import {
  Box,
  Button,
  IconNames,
  Tooltip,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import allMessages from '../messages';

import { TOOLBAR_HEIGHT } from './constants';
import messages from './messages';
import useViewMode, { ViewMode } from './useViewMode';

const MODES: { mode: ViewMode; icon: IconNames; label: MessageDescriptor }[] = [
  { mode: 'grid', icon: 'grid', label: messages.grid },
  { mode: 'list', icon: 'list', label: messages.list },
  { mode: 'calendar', icon: 'calendar', label: allMessages.calendar },
];

const ViewModeSwitch = () => {
  const { formatMessage } = useIntl();
  const { viewMode, setViewMode } = useViewMode();

  return (
    <Box
      role="group"
      aria-label={formatMessage(messages.view)}
      display="flex"
      height={TOOLBAR_HEIGHT}
      p="1px"
      ml="6px"
      border={`1px solid ${colors.grey300}`}
      borderRadius={bo.borderRadius}
    >
      {MODES.map(({ mode, icon, label }) => {
        const isOn = viewMode === mode;
        return (
          <Tooltip
            key={mode}
            content={formatMessage(label)}
            placement="bottom"
            theme="dark"
          >
            <Button
              type="button"
              buttonStyle="bo-text"
              icon={icon}
              iconSize="16px"
              iconColor={
                isOn ? bo.colors.textHeadingStrong : colors.coolGrey500
              }
              bgColor={isOn ? colors.grey100 : 'transparent'}
              bgHoverColor={isOn ? colors.grey100 : 'transparent'}
              // Inside the switch's border and padding, as tall as they leave
              // and with corners that follow its own.
              width={TOOLBAR_HEIGHT}
              height="100%"
              padding="0"
              borderRadius={`calc(${bo.borderRadius} - 2px)`}
              ariaLabel={formatMessage(label)}
              ariaPressed={isOn}
              onClick={() => setViewMode(mode)}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default ViewModeSwitch;
