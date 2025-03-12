import React from 'react';

import {
  Box,
  Text,
  Title,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ProjectLibraryProjectData } from 'api/project_library_projects/types';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import MethodLabel from '../MethodLabel';
import { useCountriesByCode, useLocalizeProjectLibrary } from '../utils';

import CardImage from './CardImage';

interface Props {
  project: ProjectLibraryProjectData;
}

const CardContainer = styled(Box)`
  &:hover {
    h3 {
      color: ${({ theme }) => theme.colors.tenantPrimary};
      text-decoration: underline;
    }

    .project-image-container > * {
      transform: scale(1.2);
    }
  }

  cursor: pointer;
`;

const ProjectCard = ({ project }: Props) => {
  const localize = useLocalizeProjectLibrary();
  const countriesByCode = useCountriesByCode();

  const { attributes, relationships } = project;

  const country =
    countriesByCode && attributes.tenant_country_alpha2
      ? countriesByCode[attributes.tenant_country_alpha2]
      : null;

  return (
    <CardContainer
      as="button"
      bgColor={colors.white}
      borderRadius={stylingConsts.borderRadius}
      w="33%"
      p="16px"
      style={{ textAlign: 'left' }}
      onClick={() => {
        updateSearchParams({ project_id: project.id });
      }}
    >
      <Box>
        <CardImage imageUrl={attributes.image_url ?? undefined} />
      </Box>
      <Box>
        <Title variant="h3" color="primary" mt="12px">
          {localize(attributes.title_multiloc, attributes.title_en)}
        </Title>
      </Box>
      <Text color="primary" fontSize="s">
        {country ? `${country.emoji_flag} ` : ''}
        {attributes.tenant_name}
      </Text>
      {relationships.phases.data.map(({ id }) => (
        <MethodLabel projectLibraryPhaseId={id} key={id} />
      ))}
    </CardContainer>
  );
};

export default ProjectCard;
