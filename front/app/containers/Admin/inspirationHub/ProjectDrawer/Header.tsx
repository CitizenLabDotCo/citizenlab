import React from 'react';

import {
  Box,
  StatusLabel,
  Icon,
  Title,
  Text,
  Quote,
  colors,
} from '@citizenlab/cl2-component-library';

import { ProjectLibraryProjectData } from 'api/project_library_projects/types';

import { parseBackendDateString } from 'utils/dateUtils';

import { POPULATION_GROUP_LABELS } from '../constants';
import { useLocalizeProjectLibrary } from '../utils';

import ExternalLink from './ExternalLink';
import { getTenantURL, getProjectURL, formatDate } from './utils';

interface Props {
  attributes: ProjectLibraryProjectData['attributes'];
}

const Header = ({ attributes }: Props) => {
  const tenantURL = getTenantURL(attributes);
  const localizeProjectLibrary = useLocalizeProjectLibrary();

  const startAt = parseBackendDateString(attributes.start_at);
  const endAt = attributes.practical_end_at
    ? parseBackendDateString(attributes.practical_end_at)
    : undefined;

  const annotation = attributes.annotation_multiloc
    ? localizeProjectLibrary(
        attributes.annotation_multiloc,
        attributes.annotation_multiloc['en'] ?? ''
      )
    : '';

  const { folder_title_en, folder_title_multiloc } = attributes;

  return (
    <Box>
      <Box display="flex" flexDirection="row" alignItems="center">
        {attributes.tenant_population_group && (
          <StatusLabel
            text={POPULATION_GROUP_LABELS[attributes.tenant_population_group]}
            backgroundColor={colors.coolGrey600}
            h="16px"
            ml="4px"
            mr="8px"
          />
        )}
        <ExternalLink href={tenantURL} mt="1px">
          {attributes.tenant_name}
        </ExternalLink>
      </Box>
      <ExternalLink href={getProjectURL(attributes)}>
        <Title variant="h2" color="textPrimary" mt="4px" mb="4px">
          {localizeProjectLibrary(
            attributes.title_multiloc,
            attributes.title_en
          )}
        </Title>
      </ExternalLink>
      <Box>
        <Box display="flex">
          <Icon
            name="calendar"
            width="16px"
            m="0"
            fill={colors.textSecondary}
          />
          <Text m="0" ml="8px" color="textSecondary">
            {formatDate(startAt)} - {formatDate(endAt)}
          </Text>
        </Box>
        <Box display="flex">
          <Icon name="users" width="16px" m="0" fill={colors.textSecondary} />
          <Text m="0" ml="8px" color="textSecondary">
            {attributes.participants}
          </Text>
        </Box>
        {folder_title_en ||
          (folder_title_multiloc && (
            <Box display="flex">
              <Icon
                name="folder-outline"
                width="16px"
                m="0"
                fill={colors.textSecondary}
              />
              <Text m="0" ml="8px" color="textSecondary">
                {localizeProjectLibrary(
                  attributes.folder_title_multiloc ?? {},
                  attributes.folder_title_en
                )}
              </Text>
            </Box>
          ))}
      </Box>
      {annotation !== '' && (
        <Quote w="100%" mt="12px">
          <Text m="0px" fontStyle="italic">
            {annotation}
          </Text>
        </Quote>
      )}
    </Box>
  );
};

export default Header;
