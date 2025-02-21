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
  Icon,
} from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';
import styled from 'styled-components';

import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

import { useRansackParams } from './utils';

const formatDuration = (date: string | null) => {
  if (!date) return '';
  return format(new Date(date), 'MMM yy');
};

const Cell = styled(Th)`
  font-weight: normal;
`;

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
            <Th>Tenant</Th>
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
              {libraryProjects.data.map(({ attributes, id }) => (
                <Tr key={id} background={colors.white}>
                  <Cell>
                    {formatDuration(attributes.start_at)} -
                    {formatDuration(attributes.practical_end_at)}
                  </Cell>
                  <Cell>{attributes.title_en}</Cell>
                  <Cell>{attributes.participants}</Cell>
                  <Cell>{attributes.tenant_name}</Cell>
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
