import React, { useEffect, useState } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useNode, useEditor, ROOT_NODE } from '@craftjs/core';
import styled from 'styled-components';

import {
  WIDGET_TITLES,
  hasNoPointerEvents,
  hasChildren,
} from 'containers/Admin/reporting/components/ReportBuilder/Widgets';

import messages from 'components/admin/ContentBuilder/messages';

import { FormattedMessage } from 'utils/cl-intl';

const StyledBox = styled(Box)<{ isRoot: boolean; outlineColor?: string }>`
  ${({ isRoot }) =>
    isRoot
      ? `
        cursor: auto;
        width: 100%;
        max-width: 1000px;
        background-color: #fff;
        min-height: 160px;
        box-sizing: content-box;
      `
      : 'cursor: move;'}

  ${({ outlineColor }) =>
    outlineColor
      ? `
      outline: 1px solid ${outlineColor};
    `
      : 'outline: none;'}

  margin-bottom: 3px;
`;

const CONTAINER = 'Container';

const RenderNode = ({ render }) => {
  const {
    id,
    name,
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
      name,
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      hasError: node.data.props?.hasError,
      title: WIDGET_TITLES[name],
      noPointerEvents: hasNoPointerEvents(name),
    };
  });

  const [isHover, setIsHover] = useState(false);

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

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const parentName = parentNode?.data?.name;
  const isChildOfComplexComponent = parentName
    ? hasChildren(parentName)
    : false;

  // Handle multi-column hover state
  useEffect(() => {
    if (!parentId) return;
    const parentNodeElement = document.getElementById(parentId);

    if (isHover && isChildOfComplexComponent) {
      parentNodeElement?.setAttribute(
        'style',
        `outline: 1px solid ${colors.primary} `
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
    isSelectable &&
    (nodeLabelIsVisible || nodeIsHovered || hasError) &&
    !invisible;

  return (
    <StyledBox
      className="e2e-render-node"
      ref={(ref) => ref && connect(drag(ref))}
      id={id}
      position="relative"
      minHeight={id === ROOT_NODE ? '160px' : '0px'}
      background="#fff"
      outlineColor={
        hasError
          ? colors.red600
          : solidBorderIsVisible
          ? colors.primary
          : 'transparent'
      }
      isRoot={id === ROOT_NODE}
      onMouseOver={(e) => {
        e.stopPropagation();
        setIsHover(true);
      }}
      onMouseOut={(e) => {
        e.stopPropagation();
        setIsHover(false);
      }}
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
