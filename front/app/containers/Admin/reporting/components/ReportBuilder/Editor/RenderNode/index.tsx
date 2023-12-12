import React, { useEffect } from 'react';
import styled from 'styled-components';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styles
import { colors } from 'utils/styleUtils';

// craft
import { useNode, useEditor, ROOT_NODE } from '@craftjs/core';

// intl
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import messages from 'components/admin/ContentBuilder/Editor/RenderNode/messages';

const StyledBox = styled(Box)`
  ${({ isRoot }: { isRoot: boolean }) =>
    isRoot
      ? `cursor: auto;
padding-top: 4px;
padding-bottom: 4px;
width: 100%;
max-width: 1000px;
background-color: #fff;
min-height: 160px;`
      : `cursor:move;`}
`;

const CONTAINER = 'Container';

const RenderNode = ({ render }) => {
  const {
    id,
    name,
    isHover,
    hasError,
    title,
    noPointerEvents,
    connectors: { connect, drag },
  } = useNode((node) => ({
    props: node.data.props,
    isHover: node.events.hovered,
    name: node.data.name,
    hasError: node.data.props.hasError,
    title: node.data.custom?.title as MessageDescriptor | undefined,
    noPointerEvents: node.data.custom?.noPointerEvents as boolean | undefined,
  }));

  const {
    isActive,
    parentId,
    isDeletable,
    actions: { selectNode },
    query: { node },
  } = useEditor((_, query) => {
    return {
      isActive: id ? query.getEvent('selected').contains(id) : undefined,
      parentId: id ? query.node(id).ancestors()[0] : undefined,
      isDeletable: id ? query.node(id).isDeletable() : undefined,
    };
  });

  const parentNode = parentId ? node(parentId).get() : undefined;
  const isChildOfComplexComponent = !!parentNode?.data?.custom?.hasChildren;

  // Handle multi-column hover state
  useEffect(() => {
    if (!parentId) return;
    const parentNodeElement = document.getElementById(parentId);

    if (isHover && isChildOfComplexComponent) {
      parentNodeElement?.setAttribute(
        'style',
        `border: 1px solid ${colors.primary} `
      );
    } else {
      parentNodeElement?.removeAttribute('style');
    }
  }, [isHover, id, isChildOfComplexComponent, parentId]);

  const isContainer = name === CONTAINER;
  const isTemplate = name === 'ProjectTemplate';
  const isBox = name === 'Box';
  const invisible = isTemplate || isBox;

  // Handle selected state
  useEffect(() => {
    if (isActive && isContainer && parentNode && isChildOfComplexComponent) {
      selectNode(parentId);
    }
  }, [
    isActive,
    isContainer,
    parentNode,
    parentId,
    isChildOfComplexComponent,
    selectNode,
  ]);

  const isSelectable = title !== undefined;

  const nodeLabelIsVisible =
    isActive && isSelectable && id !== ROOT_NODE && isDeletable && !isContainer;

  const nodeIsHovered = isHover && id !== ROOT_NODE && !isContainer;
  const solidBorderIsVisible =
    isSelectable && (nodeLabelIsVisible || nodeIsHovered || hasError);

  return (
    <StyledBox
      className="e2e-render-node"
      ref={(ref) => ref && connect(drag(ref))}
      id={id}
      position="relative"
      borderStyle={solidBorderIsVisible ? 'solid' : 'dashed'}
      minHeight={id === ROOT_NODE ? '160px' : '0px'}
      background="#fff"
      borderWidth={invisible ? '0px' : '1px'}
      borderColor={
        hasError
          ? colors.red600
          : solidBorderIsVisible
          ? colors.primary
          : isSelectable
          ? colors.divider
          : 'transparent'
      }
      my={invisible ? undefined : '4px'}
      isRoot={id === ROOT_NODE}
    >
      {nodeLabelIsVisible && (
        <Box
          id="e2e-node-label"
          p="4px"
          bgColor={hasError ? colors.red600 : colors.primary}
          color="#fff"
          position="absolute"
          top="-28px"
          left="-1px"
        >
          <FormattedMessage {...title} />
          {hasError && (
            <>
              <span> - </span>
              <FormattedMessage {...messages.error} />
            </>
          )}
        </Box>
      )}
      <div
        style={{
          pointerEvents: noPointerEvents ? 'none' : 'auto',
          width: '100%',
        }}
      >
        {render}
      </div>
    </StyledBox>
  );
};

export default RenderNode;
