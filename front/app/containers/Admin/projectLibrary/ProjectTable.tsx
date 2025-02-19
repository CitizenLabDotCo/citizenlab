import React from 'react';

import {
  Table,
  Thead,
  Tr,
  Th,
  colors,
  stylingConsts,
  Tbody,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

const Cell = styled(Th)`
  font-weight: normal;
`;

const ProjectTable = () => {
  const { data: libraryProjects } = useProjectLibraryProjects({});
  console.log({ libraryProjects });

  return (
    <Table
      border={`1px solid ${colors.grey300}`}
      borderRadius={stylingConsts.borderRadius}
      innerBorders={{
        headerCells: false,
        bodyRows: false,
      }}
    >
      <Thead>
        <Tr background={colors.grey50}>
          <Th>Project</Th>
          <Th>Project</Th>
        </Tr>
      </Thead>
      <Tbody>
        {libraryProjects?.data.map((project) => (
          <Tr key={project.id} background={colors.white}>
            <Cell>{project.attributes.title_en}</Cell>
            <Cell>{project.attributes.title_en}</Cell>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default ProjectTable;
