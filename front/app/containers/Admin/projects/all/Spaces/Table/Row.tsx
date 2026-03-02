import React from 'react';

import { Tr, Td, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import AvatarBubbles from 'components/AvatarBubbles';

import clHistory from 'utils/cl-router/history';

const StyledTd = styled(Td)`
  &:hover {
    cursor: pointer;
    .project-table-row-title {
      text-decoration: underline;
    }
  }
`;

type Space = {
  name: string;
  id: string;
};

interface Props {
  space: Space;
}

const Row = ({ space }: Props) => {
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
          {space.name}
        </Text>
      </StyledTd>
      <Td>
        <AvatarBubbles showParticipantText={false} />
      </Td>
    </Tr>
  );
};

export default Row;
