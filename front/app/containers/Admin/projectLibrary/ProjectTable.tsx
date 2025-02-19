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
          <Th>Participants</Th>
          <Th>Tenant</Th>
          <Th>Topic</Th>
          <Th>End date</Th>
        </Tr>
      </Thead>
      <Tbody>
        {libraryProjects?.data.map((project) => (
          <Tr key={project.id} background={colors.white}>
            <Cell>{project.attributes.title_en}</Cell>
            <Cell>{project.attributes.participants}</Cell>
            <Cell>{project.attributes.tenant_name}</Cell>
            <Cell>{project.attributes.topic_id}</Cell>
            <Cell>{project.attributes.practical_end_at}</Cell>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default ProjectTable;
