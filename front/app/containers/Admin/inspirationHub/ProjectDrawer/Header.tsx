import React from 'react';

import {
  Box,
  StatusLabel,
  Icon,
  Title,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import { ProjectLibraryProjectData } from 'api/project_library_projects/types';

import { parseBackendDateString } from 'utils/dateUtils';

import { useLocalizeProjectLibrary } from '../utils';

import ExternalLink from './ExternalLink';
import { getTenantURL, getProjectURL, formatDate } from './utils';

interface Props {
  projectData: ProjectLibraryProjectData;
}

const Header = ({ projectData }: Props) => {
  const { attributes } = projectData;
  const tenantURL = getTenantURL(attributes);
  const localizeProjectLibrary = useLocalizeProjectLibrary();

  const startAt = parseBackendDateString(attributes.start_at);
  const endAt = attributes.practical_end_at
    ? parseBackendDateString(attributes.practical_end_at)
    : undefined;

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
      <ExternalLink href={getProjectURL(attributes)}>
        <Title variant="h2" color="textPrimary" mt="4px" mb="4px">
          {localizeProjectLibrary(projectData, 'title')}
        </Title>
      </ExternalLink>
      <Box display="flex" flexDirection="row" alignItems="center">
        <Icon
          name="calendar"
          width="16px"
          m="0"
          ml="4px"
          fill={colors.textSecondary}
        />
        <Text m="0" ml="4px" color="textSecondary">
          {formatDate(startAt)} - {formatDate(endAt)}
        </Text>
        <Text my="0" mx="12px" color="textSecondary">
          {' · '}
        </Text>
        <Icon name="users" width="16px" m="0" fill={colors.textSecondary} />
        <Text m="0" ml="4px" color="textSecondary">
          {attributes.participants}
        </Text>
        {attributes.folder_title_en && (
          <>
            <Text my="0" mx="12px" color="textSecondary">
              {' · '}
            </Text>
            <Icon
              name="folder-outline"
              width="16px"
              m="0"
              fill={colors.textSecondary}
            />
            <Text m="0" ml="4px" color="textSecondary">
              {localizeProjectLibrary(projectData, 'folder_title')}
            </Text>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Header;
