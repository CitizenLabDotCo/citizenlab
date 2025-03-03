import React from 'react';

import {
  Table,
  colors,
  stylingConsts,
  Spinner,
  Box,
} from '@citizenlab/cl2-component-library';

import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

import { PaginationWithoutPositioning } from 'components/Pagination';

import { useRansackParams } from '../utils';

import TableBody from './TableBody';
import TableHead from './TableHead';

const ProjectTable = () => {
  const {
    data: libraryProjects,
    isInitialLoading,
    isRefetching,
  } = useProjectLibraryProjects(useRansackParams());

  return (
    <Box>
      <Box position="relative">
        <Table
          border={`1px solid ${colors.grey300}`}
          borderRadius={stylingConsts.borderRadius}
          innerBorders={{
            headerCells: false,
            bodyRows: false,
          }}
        >
          <TableHead />
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
      <Box w="100%" mt="20px" display="flex" justifyContent="center">
        <PaginationWithoutPositioning
          currentPage={1}
          totalPages={5}
          loadPage={() => {}}
        />
      </Box>
    </Box>
  );
};

export default ProjectTable;
