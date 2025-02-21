import React from 'react';

import {
  Tr,
  Th,
  colors,
  Tbody,
  Spinner,
} from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';
import styled from 'styled-components';

import { ProjectLibraryProjects } from 'api/project_library_projects/types';

interface Props {
  libraryProjects?: ProjectLibraryProjects;
  isInitialLoading: boolean;
}

const formatDuration = (date: string | null) => {
  if (!date) return '';
  return format(new Date(date), 'MMM yy');
};

const Cell = styled(Th)`
  font-weight: normal;
`;

const TableBody = ({ libraryProjects, isInitialLoading }: Props) => {
  return (
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
  );
};

export default TableBody;
