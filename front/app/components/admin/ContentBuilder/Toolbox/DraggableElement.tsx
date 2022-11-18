import React from 'react';
import styled from 'styled-components';

// craft
import { useEditor } from '@craftjs/core';

// components
import { Box, Icon, IconNames, Text } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';

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

const ToolboxItem = ({ icon, label }: ToolboxItemProps) => {
  return (
    <StyledBox
      width="100%"
      display="flex"
      paddingLeft="10px"
      alignItems="center"
    >
      <Icon
        marginRight="16px"
        width="20px"
        height="20px"
        fill={colors.primary}
        name={icon}
      />
      <Text color="textPrimary" style={{ lineHeight: '1' }}>
        {label}
      </Text>
    </StyledBox>
  );
};

const DraggableContainer = styled.div`
  cursor: move;
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
