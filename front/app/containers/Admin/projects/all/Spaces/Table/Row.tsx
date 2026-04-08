import React from 'react';

import { Tr, Td, Text, Box, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { SpaceData } from 'api/spaces/types';
import { IUserData } from 'api/users/types';

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
  spaceModeratorsById?: Record<string, IUserData>;
}

const Row = ({ space, spaceModeratorsById }: Props) => {
  const localize = useLocalize();

  console.log(spaceModeratorsById);

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
