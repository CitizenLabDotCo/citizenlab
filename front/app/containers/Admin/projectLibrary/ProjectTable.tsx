import React from 'react';

import {
  Table,
  Thead,
  Tr,
  Th,
  colors,
  stylingConsts,
  Tbody,
  Spinner,
  Box,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ProjectLibraryProjects } from 'api/project_library_projects/types';

const Cell = styled(Th)`
  font-weight: normal;
`;

interface Props {
  libraryProjects?: ProjectLibraryProjects;
  isInitialLoading: boolean;
  isRefetching: boolean;
}

const ProjectTable = ({
  libraryProjects,
  isInitialLoading,
  isRefetching,
}: Props) => {
  return (
    <Box position="relative">
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
          {isInitialLoading && (
            <Tr background={colors.white}>
              <Th colSpan={5}>
                <Spinner />
              </Th>
            </Tr>
          )}

          {libraryProjects && (
            <>
              {libraryProjects.data.map((project) => (
                <Tr key={project.id} background={colors.white}>
                  <Cell>{project.attributes.title_en}</Cell>
                  <Cell>{project.attributes.participants}</Cell>
                  <Cell>{project.attributes.tenant_name}</Cell>
                  {/* <Cell>{project.attributes.topic_id}</Cell> */}
                  <Cell>Some topic</Cell>
                  <Cell>{project.attributes.practical_end_at}</Cell>
                </Tr>
              ))}
            </>
          )}
        </Tbody>
      </Table>
      {isRefetching && (
        <Box
          position="absolute"
          top="0"
          left="0"
          zIndex="10"
          background="rgba(255, 255, 255, 0.5)"
          w="100%"
          h="100%"
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="100%"
          >
            <Spinner />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProjectTable;
