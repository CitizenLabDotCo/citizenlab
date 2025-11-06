import React, { useEffect } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useNode, useEditor, ROOT_NODE } from '@craftjs/core';
import { MessageDescriptor } from 'react-intl';
import styled from 'styled-components';

import messages from 'components/admin/ContentBuilder/messages';

import { FormattedMessage } from 'utils/cl-intl';

import { WIDGET_TITLES, hasChildren, hasNoPointerEvents } from '../../Widgets';

const StyledBox = styled(Box)`
  ${({ isRoot }: { isRoot: boolean }) =>
    isRoot
      ? `cursor: auto;
          padding: 4px;
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
  } = useNode((node) => {
    // This can sometimes be undefined, even though
    // craftjs says it can't
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!node) return {};
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!node.data) return {};
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!node.events) return {};

    const name = node.data.name;

    return {
      props: node.data.props,
      isHover: node.events.hovered,
      name,
      hasError: node.data.props.hasError,
      title:
        WIDGET_TITLES[name] ||
        (node.data.custom?.title as MessageDescriptor | undefined),
      noPointerEvents: hasNoPointerEvents(name),
    };
  });

  const {
    isActive,
    isDeletable,
    parentId,
    actions: { selectNode },
    query: { node },
  } = useEditor((_, query) => {
    return {
      isActive: id && query.getEvent('selected').contains(id),
      parentId: id && query.node(id).ancestors()[0],
      isDeletable: id && query.node(id).isDeletable(),
    };
  });

  const parentNode = parentId ? node(parentId).get() : undefined;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const parentName = parentNode?.data?.name;
  const isChildOfComplexComponent = parentName
    ? hasChildren(parentName)
    : false;

  // Handle multi-column hover state
  useEffect(() => {
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
      borderWidth="1px"
      borderColor={
        hasError
          ? colors.red600
          : solidBorderIsVisible
          ? colors.primary
          : isSelectable
          ? colors.divider
          : 'transparent'
      }
      my="4px"
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
