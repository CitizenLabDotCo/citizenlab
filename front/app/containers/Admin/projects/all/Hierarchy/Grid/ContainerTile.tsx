import React, { ReactNode } from 'react';

import { Box, Text, bo, colors } from '@citizenlab/cl2-component-library';

import Link, { typedStyled } from 'utils/cl-router/Link';

import { Level } from '../level';
import useLevelSearch from '../useLevelSearch';

const TileLink = typedStyled(Link)`
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
`;

interface Props {
  level: Level;
  title: string;
  meta: string;
  // The space icon, or a folder's thumbnail or icon.
  media: ReactNode;
}

// A space or folder in the grid: a compact tile that opens its level.
const ContainerTile = ({ level, title, meta, media }: Props) => {
  const levelSearch = useLevelSearch();

  return (
    <TileLink to="/admin/projects" search={levelSearch(level)}>
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
      <Box minWidth="0" display="flex" flexDirection="column" gap="2px">
        <Text
          as="span"
          m="0"
          variant="boControl"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {title}
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
    </TileLink>
  );
};

export default ContainerTile;
