import React, { useEffect } from 'react';
import styled from 'styled-components';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styles
import { colors } from 'utils/styleUtils';

// craft
import { useNode, useEditor, ROOT_NODE } from '@craftjs/core';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

const CONTAINER = 'Container';
const TWO_COLUMNS = 'TwoColumn';
const THREE_COLUMNS = 'ThreeColumn';
const TEXT = 'Text';
const IMAGE = 'Image';
const IFRAME = 'Iframe';
const ABOUT_BOX = 'AboutBox';
const ACCORDION = 'Accordion';
const WHITE_SPACE = 'WhiteSpace';
const IMAGE_TEXT_CARDS = 'ImageTextCards';
const INFO_WITH_ACCORDIONS = 'InfoWithAccordions';

type ComponentNamesType =
  | typeof CONTAINER
  | typeof TWO_COLUMNS
  | typeof THREE_COLUMNS
  | typeof TEXT
  | typeof IMAGE
  | typeof IFRAME
  | typeof ABOUT_BOX
  | typeof ACCORDION
  | typeof WHITE_SPACE
  | typeof IMAGE_TEXT_CARDS
  | typeof INFO_WITH_ACCORDIONS;

export const getComponentNameMessage = (name: ComponentNamesType) => {
  switch (name) {
    case TWO_COLUMNS:
      return messages.twoColumn;
    case THREE_COLUMNS:
      return messages.threeColumn;
    case TEXT:
      return messages.text;
    case IMAGE:
      return messages.image;
    case IFRAME:
      return messages.url;
    case ABOUT_BOX:
      return messages.aboutBox;
    case ACCORDION:
      return messages.accordion;
    case WHITE_SPACE:
      return messages.whiteSpace;
    case IMAGE_TEXT_CARDS:
      return messages.imageTextCards;
    case INFO_WITH_ACCORDIONS:
      return messages.infoWithAccordions;
    default:
      return messages.default;
  }
};

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

const RenderNode = ({ render }) => {
  const {
    id,
    name,
    isHover,
    hasError,
    connectors: { connect, drag },
  } = useNode((node) => ({
    isHover: node.events.hovered,
    name: node.data.name as ComponentNamesType,
    hasError: node.data.props.hasError,
  }));

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

  const parentNode = parentId && node(parentId).get();
  const parentNodeName = parentNode && parentNode.data.name;

  // Handle multi-column hover state
  useEffect(() => {
    const parentNodeElement = document.getElementById(parentId);

    if (
      isHover &&
      (parentNodeName === TWO_COLUMNS ||
        parentNodeName === THREE_COLUMNS ||
        parentNodeName === INFO_WITH_ACCORDIONS)
    ) {
      parentNodeElement?.setAttribute(
        'style',
        `border: 1px solid ${colors.adminTextColor} `
      );
    } else {
      parentNodeElement?.removeAttribute('style');
    }
  }, [isHover, id, parentNodeName, parentId]);

  // Handle selected state
  useEffect(() => {
    if (isActive && name === CONTAINER && parentNode) {
      if (
        parentNodeName === TWO_COLUMNS ||
        parentNodeName === THREE_COLUMNS ||
        parentNodeName === INFO_WITH_ACCORDIONS
      ) {
        selectNode(parentId);
      }
    }
  });

  const isSelectable = getComponentNameMessage(name) !== messages.default;
  const nodeLabelIsVisible =
    isActive && isSelectable && id !== ROOT_NODE && isDeletable;
  const nodeIsHovered = isHover && id !== ROOT_NODE;
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
          ? colors.clRedError
          : solidBorderIsVisible
          ? colors.adminTextColor
          : name !== TWO_COLUMNS &&
            name !== THREE_COLUMNS &&
            name !== INFO_WITH_ACCORDIONS
          ? colors.separation
          : 'transparent'
      }
      m="4px"
      isRoot={id === ROOT_NODE}
    >
      {nodeLabelIsVisible && (
        <Box
          id="e2e-node-label"
          p="4px"
          bgColor={hasError ? colors.clRedError : colors.adminTextColor}
          color="#fff"
          position="absolute"
          top="-28px"
          left="-1px"
        >
          <FormattedMessage {...getComponentNameMessage(name)} />
          {hasError && (
            <>
              <span> - </span>
              <FormattedMessage {...messages.error} />
            </>
          )}
        </Box>
      )}
      <div style={{ pointerEvents: name === IFRAME ? 'none' : 'auto' }}>
        {render}
      </div>
    </StyledBox>
  );
};

export default RenderNode;
