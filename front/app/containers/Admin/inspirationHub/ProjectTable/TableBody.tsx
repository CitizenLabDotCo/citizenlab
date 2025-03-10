import React, { useMemo } from 'react';

import {
  Tr,
  Th,
  Tbody,
  Spinner,
  Box,
  StatusLabel,
  colors,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useProjectLibraryCountries from 'api/project_library_countries/useProjectLibraryCountries';
import { ProjectLibraryProjects } from 'api/project_library_projects/types';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import { STATUS_EMOJIS, STATUS_LABELS } from '../constants';

import MethodLabel from './MethodLabel';
import { formatDuration } from './utils';

interface Props {
  libraryProjects?: ProjectLibraryProjects;
  isInitialLoading: boolean;
}

const Cell = styled(Th)`
  font-weight: normal;
  max-width: 200px;
`;

const TextButton = styled.button`
  margin: 0;
  padding: 0;

  &:hover {
    color: ${colors.grey800};
    text-decoration: underline;
  }

  cursor: pointer;
  font-weight: bold;
  text-align: left;
`;

const TableBody = ({ libraryProjects, isInitialLoading }: Props) => {
  const { formatMessage } = useIntl();
  const { data: countries } = useProjectLibraryCountries();
  const [searchParams] = useSearchParams();

  const drawerProjectId = searchParams.get('project_id');

  const countriesByCode = useMemo(() => {
    if (!countries) return;

    return countries.data.attributes.reduce((acc, country) => {
      acc[country.code] = country.short_name;
      return acc;
    }, {} as Record<string, string>);
  }, [countries]);

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
          {libraryProjects.data.map(({ attributes, id, relationships }) => {
            const countryCode = attributes.tenant_country_alpha2;

            return (
              <Tr key={id} background={colors.white}>
                <Cell>
                  {formatDuration(attributes.start_at)} -
                  {formatDuration(attributes.practical_end_at)}
                </Cell>
                <Cell>
                  <TextButton
                    onClick={() => {
                      id === drawerProjectId
                        ? removeSearchParams(['project_id'])
                        : updateSearchParams({ project_id: id });
                    }}
                  >
                    {attributes.title_en}
                  </TextButton>
                  <br />
                  <Box
                    as="span"
                    display="block"
                    color={colors.textSecondary}
                    mt="4px"
                  >
                    {STATUS_EMOJIS[attributes.status]}{' '}
                    {formatMessage(STATUS_LABELS[attributes.status])}
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
                    {countryCode && countriesByCode
                      ? countriesByCode[countryCode]
                      : ''}
                  </Box>
                </Cell>
                <Cell>
                  {relationships.phases.data.map(({ id }) => (
                    <MethodLabel key={id} projectLibraryPhaseId={id} />
                  ))}
                </Cell>
              </Tr>
            );
          })}
        </>
      )}
    </Tbody>
  );
};

export default TableBody;
