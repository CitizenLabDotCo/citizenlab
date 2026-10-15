import React, { ReactNode } from 'react';

import { Box, Td, Text, bo, colors } from '@citizenlab/cl2-component-library';

import Link, { typedStyled } from 'utils/cl-router/Link';

import { Level } from '../level';
import useLevelSearch from '../useLevelSearch';

const StretchedLink = typedStyled(Link)`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${bo.colors.textHeadingStrong};

  &::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  &:hover {
    color: ${bo.colors.textHeadingStrong};
  }
`;

interface Props {
  lead: ReactNode;
  title: string;
  target: { level: Level } | { projectId: string };
  // Grey text after the title: what a space or folder holds, or where a
  // project sits.
  note?: string;
}

const TitleCell = ({ lead, title, target, note }: Props) => {
  const levelSearch = useLevelSearch();

  return (
    <Td>
      <Box display="flex" alignItems="center" gap="8px" minWidth="0">
        <Box
          flex="none"
          width="24px"
          height="24px"
          borderRadius="4px"
          overflow="hidden"
          display="flex"
          alignItems="center"
          justifyContent="center"
          background={colors.grey100}
        >
          {lead}
        </Box>
        <Text as="span" m="0" variant="boControl" minWidth="0" display="flex">
          {'projectId' in target ? (
            <StretchedLink
              to="/admin/projects/$projectId"
              params={{ projectId: target.projectId }}
            >
              {title}
            </StretchedLink>
          ) : (
            <StretchedLink
              to="/admin/projects"
              search={levelSearch(target.level)}
            >
              {title}
            </StretchedLink>
          )}
        </Text>
        {note && (
          <Text
            as="span"
            m="0"
            variant="boMicro"
            color="coolGrey500"
            minWidth="0"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {note}
          </Text>
        )}
      </Box>
    </Td>
  );
};

export default TitleCell;
