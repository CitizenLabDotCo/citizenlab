import React from 'react';

import { Tr, Td, Text, Box, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { SpaceData } from 'api/spaces/types';

import useLocalize from 'hooks/useLocalize';

import clHistory from 'utils/cl-router/history';

import ActionsMenu from './ActionsMenu';

const StyledTd = styled(Td)`
  &:hover {
    cursor: pointer;
    .project-table-row-title {
      text-decoration: underline;
    }
  }
`;

interface Props {
  space: SpaceData;
}

const Row = ({ space }: Props) => {
  const localize = useLocalize();

  return (
    <Tr dataCy="projects-overview-folder-table-row">
      <StyledTd
        background={colors.grey50}
        onClick={() => {
          clHistory.push(`/admin/projects/spaces/${space.id}`);
        }}
      >
        <Text
          m="0"
          fontSize="s"
          color="black"
          className="project-table-row-title"
        >
          {localize(space.attributes.title_multiloc)}
        </Text>
      </StyledTd>
      <Td background={colors.grey50} width="40px">
        <Box mr="12px">
          <ActionsMenu space={space} />
        </Box>
      </Td>
    </Tr>
  );
};

export default Row;
