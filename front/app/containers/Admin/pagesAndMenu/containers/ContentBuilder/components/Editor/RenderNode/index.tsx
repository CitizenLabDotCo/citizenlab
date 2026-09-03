import React, { useEffect } from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';
import { useNode, useEditor, ROOT_NODE } from '@craftjs/core';
import { MessageDescriptor } from 'react-intl';
import styled from 'styled-components';

import messages from 'components/admin/ContentBuilder/messages';
import { useVerticalRhythmMargin } from 'components/admin/ContentBuilder/verticalRhythm';

import { FormattedMessage } from 'utils/cl-intl';

import { WIDGET_TITLES, hasChildren, hasNoPointerEvents } from '../../Widgets';

const StyledBox = styled(Box)`
  ${({ isRoot, isLocked }: { isRoot: boolean; isLocked?: boolean }) =>
    isRoot
      ? `cursor: auto;
          padding: 4px;
          width: 100%;
          max-width: 1000px;
          background-color: #fff;
          min-height: 160px;`
      : isLocked
      ? `cursor: default;`
      : `cursor:move;`}
`;

const CONTAINER = 'Container';

const RenderNode = ({ render }) => {
  const rhythmMarginTop = useVerticalRhythmMargin();
  const {
    id,
    name,
    isHover,
    hasError,
    title,
    locked,
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
      locked: node.data.custom?.locked === true,
      noPointerEvents:
        hasNoPointerEvents(name) || node.data.custom?.noPointerEvents === true,
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
  const accentColor = locked ? colors.textSecondary : colors.primary;

  return (
    <StyledBox
      className="e2e-render-node"
      ref={(ref) => {
        if (!ref) return;
        // Without the drag connector craftjs cannot start a drag, so a locked
        // node never shows a drop indicator.
        if (locked) {
          connect(ref);
        } else {
          connect(drag(ref));
        }
      }}
      id={id}
      position="relative"
      borderStyle={solidBorderIsVisible ? 'solid' : 'dashed'}
      minHeight={id === ROOT_NODE ? '160px' : '0px'}
      borderWidth="1px"
      borderColor={
        hasError
          ? colors.red600
          : solidBorderIsVisible
          ? accentColor
          : isSelectable
          ? colors.divider
          : 'transparent'
      }
      mt={rhythmMarginTop ?? '4px'}
      mb={rhythmMarginTop === undefined ? '4px' : '0px'}
      isRoot={id === ROOT_NODE}
      isLocked={locked}
    >
      {nodeLabelIsVisible && (
        <Box
          id="e2e-node-label"
          display="flex"
          alignItems="center"
          gap="4px"
          p="4px"
          bgColor={hasError ? colors.red600 : accentColor}
          color="#fff"
          position="absolute"
          top="-28px"
          left="-1px"
        >
          {locked && (
            <Icon name="lock" width="16px" height="16px" fill="#fff" />
          )}
          {locked ? (
            <FormattedMessage
              {...messages.lockedNodeLabel}
              values={{ widgetName: <FormattedMessage {...title} /> }}
            />
          ) : (
            <FormattedMessage {...title} />
          )}
          {hasError && (
            <>
              <span> - </span>
              <FormattedMessage {...messages.error} />
            </>
          )}
        </Box>
      )}
      <Box
        pointerEvents={noPointerEvents ? 'none' : 'auto'}
        width="100%"
        // `pointer-events: none` still leaves the preview content keyboard-
        // focusable; `inert` removes it from the tab order too. React 18 has
        // no `inert` prop, so the attribute is set on the element directly.
        ref={(element: HTMLElement | null) => {
          if (!element) return;
          if (noPointerEvents) {
            element.setAttribute('inert', '');
          } else {
            element.removeAttribute('inert');
          }
        }}
      >
        {render}
      </Box>
    </StyledBox>
  );
};

export default RenderNode;
