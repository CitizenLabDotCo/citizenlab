import React, { forwardRef } from 'react';
import styled from 'styled-components';

// craft
import { useEditor } from '@craftjs/core';

// components
import {
  Box,
  Icon,
  IconNames,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import Tippy from '@tippyjs/react';

const StyledBox = styled(Box)`
  &:hover {
    background-color: ${colors.grey200};
    transition: background-color 80ms ease-out 0s;
  }
`;

interface ToolboxItemProps {
  label: string;
  icon: IconNames;
  disabled?: boolean;
}

const ToolboxItem = forwardRef(
  (
    { disabled, icon, label }: ToolboxItemProps,
    ref: React.RefObject<HTMLDivElement>
  ) => {
    return (
      <StyledBox
        width="100%"
        display="flex"
        paddingLeft="10px"
        alignItems="center"
        ref={ref}
      >
        <Icon
          marginRight="16px"
          width="20px"
          height="20px"
          fill={disabled ? colors.textSecondary : colors.primary}
          name={icon}
        />

        <Text
          color={disabled ? 'textSecondary' : 'textPrimary'}
          style={{ lineHeight: '1' }}
        >
          {label}
        </Text>
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
  disabled?: boolean;
  tooltipContent?: React.ReactNode;
}

const DraggableElement = ({
  id,
  component,
  icon,
  label,
  disabled,
  tooltipContent,
}: Props) => {
  const {
    connectors,
    actions: { selectNode },
  } = useEditor();

  return (
    <DraggableContainer
      disabled={disabled}
      id={id}
      ref={(ref) =>
        ref &&
        !disabled &&
        connectors.create(ref, component, {
          onCreate: (node) => {
            selectNode(node.rootNodeId);
          },
        })
      }
    >
      <Tippy
        content={tooltipContent}
        maxWidth="250px"
        placement="bottom-end"
        hideOnClick={false}
        disabled={!disabled || !tooltipContent}
        zIndex={999999}
      >
        <ToolboxItem icon={icon} label={label} disabled={disabled} />
      </Tippy>
    </DraggableContainer>
  );
};

export default DraggableElement;
