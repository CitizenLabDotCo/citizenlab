import React from 'react';

import { Tr, Td, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { MiniProjectFolder } from 'api/project_folders_mini/types';

import useLocalize from 'hooks/useLocalize';

import clHistory from 'utils/cl-router/history';

const StyledTd = styled(Td)`
  &:hover {
    cursor: pointer;
    .project-table-row-title {
      text-decoration: underline;
    }
  }
`;

interface Props {
  folder: MiniProjectFolder;
}

const Row = ({ folder }: Props) => {
  const localize = useLocalize();

  return (
    <Tr>
      <StyledTd
        background={colors.grey50}
        onClick={() => {
          clHistory.push(`/admin/projects/folders/${folder.id}`);
        }}
      >
        <Text>{localize(folder.attributes.title_multiloc)}</Text>
      </StyledTd>
      <Td>
        <Text>Manager (TODO)</Text>
      </Td>
      <Td>
        <Text>Status (TODO)</Text>
      </Td>
    </Tr>
  );
};

export default Row;
