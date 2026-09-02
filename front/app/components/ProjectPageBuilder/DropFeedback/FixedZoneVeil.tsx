import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import {
  EditorState,
  NodeId,
  Nodes,
  ROOT_NODE,
  useEditor,
} from '@craftjs/core';

import { FormattedMessage } from 'utils/cl-intl';

import { OVERLAY_Z_INDEX } from './constants';
import messages from './messages';

const BODY_REGION = 'ProjectPageBody';

// craft.js types its node map as total, so an absent id has to be ruled out
// before reading from it.
const domOf = (nodes: Nodes, id: NodeId | undefined) =>
  id && id in nodes ? nodes[id].dom : null;

// The fixed zone is whatever sits above the page body: the project image and
// the title. Both regions expose their DOM node through the editor state, so
// the veil is measured from those two rather than from the widgets themselves.
const collectRegionDoms = (state: EditorState) => {
  const bodyId = Object.keys(state.nodes).find(
    (id) => state.nodes[id].data.name === BODY_REGION
  );

  return {
    rootDom: domOf(state.nodes, ROOT_NODE),
    bodyDom: domOf(state.nodes, bodyId),
  };
};

const FixedZoneVeil = () => {
  const { rootDom, bodyDom } = useEditor(collectRegionDoms);

  if (!rootDom || !bodyDom) return null;

  const root = rootDom.getBoundingClientRect();
  const height = bodyDom.getBoundingClientRect().top - root.top;

  if (height <= 0) return null;

  return (
    <Box
      position="fixed"
      top={`${root.top}px`}
      left={`${root.left}px`}
      width={`${root.width}px`}
      height={`${height}px`}
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={OVERLAY_Z_INDEX}
      pointerEvents="none"
      data-cy="fixed-zone-veil"
    >
      <Box
        position="absolute"
        top="0px"
        left="0px"
        w="100%"
        h="100%"
        bgColor={colors.white}
        opacity={0.72}
      />
      <Box
        position="relative"
        display="flex"
        alignItems="center"
        gap="12px"
        px="20px"
        py="14px"
        bgColor={colors.white}
        borderRadius="8px"
        boxShadow="0 6px 20px rgba(0, 0, 0, 0.14)"
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="36px"
          h="36px"
          borderRadius="50%"
          bgColor={colors.grey200}
        >
          <Icon
            name="lock"
            width="18px"
            height="18px"
            fill={colors.textSecondary}
          />
        </Box>
        <Box>
          <Text m="0px" fontSize="s" fontWeight="bold">
            <FormattedMessage {...messages.fixedZoneTitle} />
          </Text>
          <Text m="0px" fontSize="xs" color="textSecondary">
            <FormattedMessage {...messages.fixedZoneNote} />
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default FixedZoneVeil;
