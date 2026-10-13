import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  bo,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

const NavButton = styled(Box)`
  .label {
    font-size: ${fontSizes.xs}px;
    font-weight: 400;
    color: ${colors.coolGrey700};
  }

  svg {
    fill: ${colors.coolGrey700};
  }

  &[aria-selected='true'],
  &:hover {
    .label {
      color: ${bo.colors.textHeadingStrong};
    }

    svg {
      fill: ${bo.colors.textHeadingStrong};
    }
  }

  &[aria-selected='true'] .label {
    font-weight: 500;
  }

  &:not([aria-selected='true']):hover {
    background: ${colors.grey100};
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
      minHeight="36px"
      px="12px"
      py="8px"
      border="none"
      borderRadius={bo.borderRadius}
      background={selected ? colors.grey100 : 'transparent'}
      cursor="pointer"
    >
      <Icon name={icon} width="16px" height="16px" />
      <Text className="label" as="span" m="0px" lineHeight="1.6">
        {formatMessage(label)}
      </Text>
    </NavButton>
  );
};

export default NavItem;
