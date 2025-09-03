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

const StyledBox = styled(Box)`
  &:hover {
    background-color: ${colors.grey200};
    transition: background-color 80ms ease-out 0s;
  }
`;

interface ToolboxItemProps {
  label: string;
  icon: IconNames;
}

const ToolboxItem = forwardRef(
  ({ icon, label }: ToolboxItemProps, ref: React.RefObject<HTMLDivElement>) => {
    return (
      <StyledBox
        width="100%"
        display="flex"
        paddingLeft="10px"
        alignItems="center"
        ref={ref}
      >
        <Box>
          <Icon
            marginRight="16px"
            width="20px"
            height="20px"
            fill={colors.primary}
            name={icon}
          />
        </Box>

        <Text color="textPrimary" lineHeight="1">
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
}

const DraggableElement = ({ id, component, icon, label }: Props) => {
  const {
    connectors,
    actions: { selectNode },
  } = useEditor();

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
      <ToolboxItem icon={icon} label={label} />
    </DraggableContainer>
  );
};

export default DraggableElement;
