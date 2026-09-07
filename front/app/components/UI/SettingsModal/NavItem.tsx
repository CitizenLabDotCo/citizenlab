import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

const NavButton = styled(Box)`
  .label {
    font-size: 13px;
    font-weight: 400;
  }

  &[aria-selected='true'] .label {
    font-weight: 500;
  }

  &:not([aria-selected='true']):hover {
    background: ${colors.grey100};

    .label {
      color: ${colors.textPrimary};
    }

    svg {
      fill: ${colors.textPrimary};
    }
  }
`;

interface Props {
  tabId: string;
  panelId: string;
  label: MessageDescriptor;
  icon: IconNames;
  selected: boolean;
  onSelect: () => void;
}

const NavItem = ({
  tabId,
  panelId,
  label,
  icon,
  selected,
  onSelect,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <NavButton
      as="button"
      type="button"
      id={tabId}
      role="tab"
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      display="flex"
      alignItems="center"
      gap="10px"
      w="100%"
      px="12px"
      py="8px"
      border="none"
      borderRadius="8px"
      background={selected ? colors.grey200 : 'transparent'}
      cursor="pointer"
    >
      <Icon
        name={icon}
        width="16px"
        height="16px"
        fill={selected ? colors.textPrimary : colors.coolGrey700}
      />
      <Text
        className="label"
        as="span"
        m="0px"
        color={selected ? 'textPrimary' : 'coolGrey700'}
      >
        {formatMessage(label)}
      </Text>
    </NavButton>
  );
};

export default NavItem;
