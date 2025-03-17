import React from 'react';

import {
  Box,
  Text,
  Title,
  Icon,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import Quote from 'component-library/components/Quote';
import styled from 'styled-components';

import useProjectLibraryPhases from 'api/project_library_phases/useProjectLibraryPhases';
import { ProjectLibraryProjectData } from 'api/project_library_projects/types';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import { useCountriesByCode, useLocalizeProjectLibrary } from '../../utils';
import MethodLabel from '../MethodLabel';

import CardImage from './CardImage';
import { getMethods } from './utils';

interface Props {
  project: ProjectLibraryProjectData;
  showStamp?: boolean;
  showQuote?: boolean;
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

const ProjectCard = ({
  project,
  showStamp = false,
  showQuote = false,
}: Props) => {
  const localize = useLocalizeProjectLibrary();
  const countriesByCode = useCountriesByCode();

  const { attributes, relationships } = project;

  const country =
    countriesByCode && attributes.tenant_country_alpha2
      ? countriesByCode[attributes.tenant_country_alpha2]
      : null;

  const phaseIds = relationships.phases.data.map(({ id }) => id);

  const phases = useProjectLibraryPhases(phaseIds);
  const methods = getMethods(phases);

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
      }}
    >
      <Box>
        <CardImage
          imageUrl={attributes.image_url ?? undefined}
          showStamp={showStamp}
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
      {showQuote && (
        <Quote w="100%" mb="12px">
          <Text m="0px" fontStyle="italic">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
            tempus dolor eget nisi volutpat luctus
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
