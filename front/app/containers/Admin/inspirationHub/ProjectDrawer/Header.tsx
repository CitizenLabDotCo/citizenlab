import React from 'react';

import {
  Box,
  StatusLabel,
  Icon,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';

import { ProjectLibraryProjectData } from 'api/project_library_projects/types';

import ExternalLink from './ExternalLink';

interface Props {
  attributes: ProjectLibraryProjectData['attributes'];
}

const Header = ({ attributes }: Props) => {
  const tenantURL = `https://${attributes.tenant_host}`;

  return (
    <Box>
      <Box display="flex" flexDirection="row" alignItems="center">
        <StatusLabel
          text={attributes.tenant_population_group}
          backgroundColor={colors.coolGrey600}
          h="16px"
          w="24px"
          ml="4px"
        />
        <ExternalLink href={tenantURL} ml="8px" mt="1px">
          {attributes.tenant_name}
        </ExternalLink>
      </Box>
      <ExternalLink href={`${tenantURL}/projects/${attributes.slug}`}>
        <Title variant="h2" color="textPrimary" mt="12px">
          {attributes.title_en}
        </Title>
      </ExternalLink>
      <Box>
        <Icon
          name="calendar"
          width="16px"
          m="0"
          ml="4px"
          fill={colors.textSecondary}
        />
      </Box>
    </Box>
  );
};

export default Header;
