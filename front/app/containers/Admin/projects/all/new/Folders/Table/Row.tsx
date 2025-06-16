import React from 'react';

import { Tr, Td, Text } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IProjectFolderData } from 'api/project_folders/types';

import useLocalize from 'hooks/useLocalize';

const StyledTd = styled(Td)`
  &:hover {
    cursor: pointer;
    .project-table-row-title {
      text-decoration: underline;
    }
  }
`;

interface Props {
  folder: IProjectFolderData;
}

const Row = ({ folder }: Props) => {
  const localize = useLocalize();

  return (
    <Tr>
      <StyledTd>
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
