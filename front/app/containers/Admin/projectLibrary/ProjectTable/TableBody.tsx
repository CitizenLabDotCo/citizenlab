import React from 'react';

import {
  Tr,
  Th,
  colors,
  Tbody,
  Spinner,
  Box,
  StatusLabel,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ProjectLibraryProjects } from 'api/project_library_projects/types';

import { formatDuration, STATUS_EMOJIS, STATUS_LABELS } from './utils';

interface Props {
  libraryProjects?: ProjectLibraryProjects;
  isInitialLoading: boolean;
}

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
              <Cell>
                {attributes.title_en}
                <br />
                <Box
                  as="span"
                  display="block"
                  color={colors.textSecondary}
                  mt="4px"
                >
                  {STATUS_EMOJIS[attributes.status]}{' '}
                  {STATUS_LABELS[attributes.status]}
                </Box>
              </Cell>
              <Cell>{attributes.participants}</Cell>
              <Cell>
                {attributes.tenant_name}
                <StatusLabel
                  text={attributes.tenant_population_group}
                  backgroundColor={colors.coolGrey600}
                  h="16px"
                  w="24px"
                  ml="4px"
                />
                <Box
                  as="span"
                  display="block"
                  color={colors.textSecondary}
                  mt="4px"
                >
                  {attributes.tenant_country_alpha2}
                </Box>
              </Cell>
            </Tr>
          ))}
        </>
      )}
    </Tbody>
  );
};

export default TableBody;
