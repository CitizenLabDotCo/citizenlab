import React from 'react';

import {
  Table,
  colors,
  stylingConsts,
  Spinner,
  Box,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

import { PaginationWithoutPositioning } from 'components/Pagination';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import { useRansackParams } from '../utils';

import TableBody from './TableBody';
import TableHead from './TableHead';

const ProjectTable = () => {
  const ransackParams = useRansackParams();
  const [searchParams] = useSearchParams();

  const pageNumber = Number(searchParams.get('page[number]') ?? '1');

  const {
    data: libraryProjects,
    isInitialLoading,
    isRefetching,
  } = useProjectLibraryProjects({
    ...ransackParams,
    'page[number]': pageNumber,
  });

  const lastPageLink = libraryProjects?.links.last;
  const lastPage = lastPageLink ? getPageNumberFromUrl(lastPageLink) ?? 1 : 1;

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
      {lastPage > 1 && (
        <Box w="100%" mt="20px" display="flex" justifyContent="center">
          <PaginationWithoutPositioning
            currentPage={pageNumber}
            totalPages={lastPage}
            loadPage={(pageNumber) => {
              pageNumber === 1
                ? removeSearchParams(['page[number]'])
                : updateSearchParams({ 'page[number]': pageNumber.toString() });
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ProjectTable;
