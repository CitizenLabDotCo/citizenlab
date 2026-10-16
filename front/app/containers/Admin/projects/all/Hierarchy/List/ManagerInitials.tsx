import React from 'react';

import { Box, Icon, Tooltip, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import { Managers } from './useManagers';

// Each manager as their initials in a small circle, the circles overlapping
// when there are several.
const Initials = styled.span`
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${colors.grey200};
  color: ${colors.coolGrey700};
  font-size: 8px;
  font-weight: 500;
  letter-spacing: 0.02em;

  & + & {
    margin-left: -4px;
    outline: 1.5px solid ${colors.white};
  }
`;

// The parts of a manager's name that aren't blank.
const namePartsOf = ({ first_name, last_name }: Managers[number]) =>
  [first_name, last_name]
    .map((name) => name?.trim())
    .filter((name): name is string => !!name);

const nameOf = (manager: Managers[number]) => namePartsOf(manager).join(' ');

const initialsOf = (manager: Managers[number]) =>
  namePartsOf(manager)
    .map((name) => name.charAt(0))
    .join('')
    .toUpperCase();

interface Props {
  managers: Managers;
}

// A row's managers, compact enough for a narrow column: their names show on
// hover and are read out. An item without managers leaves the cell empty.
const ManagerInitials = ({ managers }: Props) => {
  const { formatMessage } = useIntl();

  if (managers.length === 0) return null;

  // An account can exist without a name: it shows as a person and reads out
  // as a manager without a name.
  const names = managers
    .map((manager) => nameOf(manager) || formatMessage(messages.unnamedManager))
    .join(', ');

  return (
    <Tooltip content={names} placement="top" theme="dark">
      {/* Above the row's stretched link, so the names show on hover. */}
      <Box display="inline-flex" position="relative" zIndex="1">
        <Box display="inline-flex" aria-hidden>
          {managers.map((manager, index) => (
            <Initials key={index}>
              {initialsOf(manager) || (
                <Icon
                  name="user"
                  width="10px"
                  height="10px"
                  fill={colors.coolGrey700}
                />
              )}
            </Initials>
          ))}
        </Box>
        <ScreenReaderOnly>{names}</ScreenReaderOnly>
      </Box>
    </Tooltip>
  );
};

export default ManagerInitials;
