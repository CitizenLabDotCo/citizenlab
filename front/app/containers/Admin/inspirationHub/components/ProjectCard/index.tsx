import React from 'react';

import {
  Box,
  Text,
  Title,
  Icon,
  colors,
  Quote,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useProjectLibraryPhases from 'api/project_library_phases/useProjectLibraryPhases';
import { ProjectLibraryProjectData } from 'api/project_library_projects/types';

import { trackEventByName } from 'utils/analytics';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import { useCountriesByCode, useLocalizeProjectLibrary } from '../../utils';
import MethodLabel from '../MethodLabel';

import CardImage from './CardImage';
import tracks from './tracks';
import { getMethods } from './utils';

interface Props {
  project: ProjectLibraryProjectData;
  isHighlighted?: boolean;
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

const ProjectCard = ({ project, isHighlighted = false }: Props) => {
  const localize = useLocalizeProjectLibrary();
  const countriesByCode = useCountriesByCode();

  const { attributes, relationships } = project;

  const country =
    countriesByCode && attributes.tenant_country_code
      ? countriesByCode[attributes.tenant_country_code]
      : null;

  const phaseIds = relationships.phases.data.map(({ id }) => id);

  const phases = useProjectLibraryPhases(phaseIds);
  const methods = getMethods(phases);

  const annotation = attributes.annotation_multiloc
    ? localize(
        attributes.annotation_multiloc,
        attributes.annotation_multiloc['en'] ?? ''
      )
    : '';

  return (
    <CardContainer
      as="button"
      bgColor={colors.white}
      borderRadius={stylingConsts.borderRadius}
      w="33%"
      p="16px"
      style={{ textAlign: 'left' }}
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      onClick={() => {
        updateSearchParams({ project_id: project.id });
        trackEventByName(tracks.previewProject, {
          project_id: project.id,
          isHighlighted,
        });
      }}
    >
      <Box>
        <CardImage
          imageUrl={attributes.image_url ?? undefined}
          showStamp={isHighlighted}
        />
      </Box>
      <Box>
        <Title variant="h3" color="primary" mt="12px" mb="8px">
          {localize(attributes.title_multiloc, attributes.title_en)}
        </Title>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        mb="12px"
      >
        <Text color="textSecondary" fontSize="s" m="0">
          {country ? `${country.emoji_flag} ` : ''}
          {attributes.tenant_name}
        </Text>
        <Box display="flex" flexDirection="row" alignItems="center">
          <Icon name="users" m="0" height="16px" />
          <Text color="textSecondary" fontSize="s" m="0">
            {attributes.participants}
          </Text>
        </Box>
      </Box>
      {isHighlighted && annotation !== '' && (
        <Quote w="100%" mb="12px">
          <Text m="0px" fontStyle="italic">
            {annotation}
          </Text>
        </Quote>
      )}
      <Box>
        {methods.map((method, i) => (
          <MethodLabel participationMethod={method} key={i} />
        ))}
      </Box>
    </CardContainer>
  );
};

export default ProjectCard;
