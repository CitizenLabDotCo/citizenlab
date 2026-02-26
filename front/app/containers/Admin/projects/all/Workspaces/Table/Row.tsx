import React from 'react';

import { Tr, Td, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import clHistory from 'utils/cl-router/history';
import AvatarBubbles from 'components/AvatarBubbles';

const StyledTd = styled(Td)`
  &:hover {
    cursor: pointer;
    .project-table-row-title {
      text-decoration: underline;
    }
  }
`;

type Workspace = {
  name: string;
  id: string;
};

interface Props {
  workspace: Workspace;
}

const Row = ({ workspace }: Props) => {
  return (
    <Tr dataCy="projects-overview-folder-table-row">
      <StyledTd
        background={colors.grey50}
        onClick={() => {
          clHistory.push(`/admin/projects/workspaces/${workspace.id}`);
        }}
      >
        <Text
          m="0"
          fontSize="s"
          color="black"
          className="project-table-row-title"
        >
          {workspace.name}
        </Text>
      </StyledTd>
      <Td>
        <AvatarBubbles showParticipantText={false} />
      </Td>
    </Tr>
  );
};

export default Row;
