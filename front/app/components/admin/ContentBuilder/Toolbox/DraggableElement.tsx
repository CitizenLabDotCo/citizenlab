import React, { forwardRef } from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';
import styled from 'styled-components';

import UpsellTooltip from 'components/UpsellTooltip';

const StyledBox = styled(Box)<{ disabled: boolean }>`
  &:hover {
    background-color: ${({ disabled }) =>
      disabled ? 'transparent' : colors.grey200};
    transition: background-color 80ms ease-out 0s;
  }
`;

interface ToolboxItemProps {
  label: string;
  icon: IconNames;
  labelSuffix?: React.ReactNode;
  disabled?: boolean;
}

const ToolboxItem = forwardRef(
  (
    { icon, label, labelSuffix, disabled = false }: ToolboxItemProps,
    ref: React.RefObject<HTMLDivElement>
  ) => {
    return (
      <StyledBox
        width="100%"
        display="flex"
        paddingLeft="10px"
        alignItems="center"
        ref={ref}
        disabled={disabled}
      >
        <Box>
          <Icon
            marginRight="16px"
            width="20px"
            height="20px"
            fill={disabled ? colors.disabled : colors.primary}
            name={icon}
          />
        </Box>

        <Text color={disabled ? 'disabled' : 'textPrimary'} lineHeight="1">
          {label}
        </Text>

        {labelSuffix && (
          <Box ml="8px" display="flex" alignItems="center">
            {labelSuffix}
          </Box>
        )}
      </StyledBox>
    );
  }
);

const DraggableContainer = styled.div<{ disabled?: boolean }>`
  width: 100%;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'grab')};
`;

interface Props extends ToolboxItemProps {
  id: string;
  component: React.ReactElement;
}

const DraggableElement = ({
  id,
  component,
  icon,
  label,
  labelSuffix,
  disabled = false,
}: Props) => {
  const {
    connectors,
    actions: { selectNode },
  } = useEditor();

  // Its own element, never wired to the editor, so a connector from an enabled render can't linger.
  if (disabled) {
    return (
      // On the body, as the scrolling toolbox would clip it.
      <UpsellTooltip
        disabled={false}
        placement="right"
        width="100%"
        appendTo={() => document.body}
      >
        <DraggableContainer id={id} disabled aria-disabled>
          <ToolboxItem
            icon={icon}
            label={label}
            labelSuffix={labelSuffix}
            disabled
          />
        </DraggableContainer>
      </UpsellTooltip>
    );
  }

  return (
    <DraggableContainer
      id={id}
      ref={(ref) =>
        ref &&
        connectors.create(ref, component, {
          onCreate: (node) => {
            selectNode(node.rootNodeId);
          },
        })
      }
    >
      <ToolboxItem icon={icon} label={label} labelSuffix={labelSuffix} />
    </DraggableContainer>
  );
};

export default DraggableElement;
