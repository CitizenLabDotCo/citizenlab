import React, { ReactNode } from 'react';

import { Box, Text, bo, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import Link, { typedStyled } from 'utils/cl-router/Link';

import DragHandle from '../Arrange/DragHandle';
import { DragArrange } from '../Arrange/useDragArrange';
import {
  dragStates,
  itemFocusRing,
  revealActions,
  stretchedLink,
} from '../itemStyles';
import { Level } from '../level';
import useLevelSearch from '../useLevelSearch';

const Tile = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 48px;
  padding: 0 8px;
  border: 1px solid ${colors.grey200};
  border-radius: ${bo.borderRadius};
  min-width: 0;
  transition: background 0.12s, border-color 0.12s;

  &:hover {
    background: ${colors.grey50};
    border-color: ${colors.coolGrey500};
  }

  ${itemFocusRing}
  ${revealActions}
  ${dragStates}
`;

const TitleLink = typedStyled(Link)`
  color: inherit;
  ${stretchedLink}

  &:hover {
    color: inherit;
  }
`;

interface Props {
  level: Level;
  title: string;
  meta: string;
  // The space icon, or a folder's thumbnail or icon.
  media: ReactNode;
  // Its "⋯".
  actions: ReactNode;
  drag: DragArrange;
}

// A space or folder in the grid: a compact tile that opens its level.
const ContainerTile = ({ level, title, meta, media, actions, drag }: Props) => {
  const levelSearch = useLevelSearch();

  return (
    <Tile ref={drag.item} className={drag.dragging ? 'dragging' : undefined}>
      {/* Over the icon or thumbnail. */}
      <DragHandle handle={drag.handle} over={{ top: '12px', left: '12px' }} />
      <Box
        flex="none"
        width="32px"
        height="32px"
        borderRadius={bo.borderRadius}
        background={colors.grey100}
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        {media}
      </Box>
      <Box
        minWidth="0"
        flex="1"
        display="flex"
        flexDirection="column"
        gap="2px"
      >
        <Text
          as="span"
          m="0"
          variant="boControl"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          <TitleLink
            data-item-link
            to="/admin/projects"
            search={levelSearch(level)}
          >
            {title}
          </TitleLink>
        </Text>
        <Text
          as="span"
          m="0"
          variant="boMicro"
          color="coolGrey500"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {meta}
        </Text>
      </Box>
      <Box data-actions position="relative" zIndex="1">
        {actions}
      </Box>
    </Tile>
  );
};

export default ContainerTile;
