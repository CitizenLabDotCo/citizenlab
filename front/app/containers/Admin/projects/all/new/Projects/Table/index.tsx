import React from 'react';

import {
  Table as TableComponent,
  Thead,
  Tr,
  Th,
  Tbody,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useProjectsMiniAdmin from 'api/projects_mini_admin/useProjectsMiniAdmin';

import Row from './Row';

const Table = () => {
  const { data } = useProjectsMiniAdmin({
    sort: 'phase_starting_or_ending_soon',
  });

  const projects = data?.pages.map((page) => page.data).flat();

  return (
    <TableComponent
      border={`1px solid ${colors.grey300}`}
      borderRadius={stylingConsts.borderRadius}
      innerBorders={{
        bodyRows: true,
      }}
    >
      <Thead>
        <Tr background={colors.grey50}>
          <Th py="16px">Project</Th>
          <Th py="16px">Current phase</Th>
          <Th py="16px">Start</Th>
          <Th py="16px">End</Th>
        </Tr>
      </Thead>
      <Tbody>
        {projects?.map((project) => (
          <Row project={project} key={project.id} />
        ))}
      </Tbody>
    </TableComponent>
  );
};

export default Table;
