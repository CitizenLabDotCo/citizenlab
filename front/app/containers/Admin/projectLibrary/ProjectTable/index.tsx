import React from 'react';

import {
  Table,
  Thead,
  Tr,
  Th,
  colors,
  stylingConsts,
  Spinner,
  Box,
  Icon,
} from '@citizenlab/cl2-component-library';

import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

import { useRansackParams } from '../utils';

import TableBody from './TableBody';

const ProjectTable = () => {
  const {
    data: libraryProjects,
    isInitialLoading,
    isRefetching,
  } = useProjectLibraryProjects(useRansackParams());

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
            <Th>Duration</Th>
            <Th>Project</Th>
            <Th>
              <Icon
                name="users"
                height="18px"
                fill={colors.primary}
                transform="translate(-2,0)"
              />
            </Th>
            <Th>Platform</Th>
          </Tr>
        </Thead>
        <TableBody
          libraryProjects={libraryProjects}
          isInitialLoading={isInitialLoading}
        />
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
