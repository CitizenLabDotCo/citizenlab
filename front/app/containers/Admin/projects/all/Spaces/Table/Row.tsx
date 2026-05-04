import React from 'react';

import { Tr, Td, Text, Box, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { SpaceData } from 'api/spaces/types';
import { IUserData } from 'api/users/types';

import useLocalize from 'hooks/useLocalize';

import clHistory from 'utils/cl-router/history';

import ManagerBubbles from '../../_shared/ManagerBubbles';

import ActionsMenu from './ActionsMenu';

const StyledTd = styled(Td)`
  &:hover {
    cursor: pointer;
    .space-table-row-title {
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

  const moderatorIds = space.relationships.moderators.data.map(
    (user) => user.id
  );
  const moderators = spaceModeratorsById
    ? moderatorIds.map((id) => spaceModeratorsById[id])
    : [];

  return (
    <Tr dataCy="spaces-overview-folder-table-row">
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
          className="space-table-row-title"
        >
          {localize(space.attributes.title_multiloc)}
        </Text>
      </StyledTd>
      <Td background={colors.grey50} width="260px">
        <ManagerBubbles
          managers={moderators.map(({ attributes }) => ({
            first_name: attributes.first_name ?? undefined,
            last_name: attributes.last_name ?? undefined,
            avatar: attributes.avatar,
          }))}
        />
      </Td>
      <Td background={colors.grey50} width="40px">
        <Box mr="12px">
          <ActionsMenu space={space} />
        </Box>
      </Td>
    </Tr>
  );
};

export default Row;
