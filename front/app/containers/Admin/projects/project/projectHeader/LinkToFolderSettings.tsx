import React, { useState } from 'react';

import {
  Box,
  Button,
  Dropdown,
  Icon,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import useLocalize from 'hooks/useLocalize';

import { createHighlighterLink } from 'components/Highlighter';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import Link from 'utils/cl-router/Link';
import { truncate } from 'utils/textUtils';

interface Props {
  folderId: string;
  projectId: string;
}

export const fragmentId = 'folder';
const LinkToFolderSettings = ({ folderId, projectId }: Props) => {
  const { data: projectFolder } = useProjectFolderById(folderId);
  const [isProjectListOpen, setIsProjectListOpen] = useState(false);
  const { data: siblingProjects } = useAdminPublications({
    childrenOfId: folderId,
  });
  const localize = useLocalize();

  if (!projectFolder) return null;

  return (
    <Box position="relative">
      <Box display="flex">
        <Link
          to={createHighlighterLink(
            `/admin/projects/${projectId}/settings#${fragmentId}`
          )}
          data-cy="e2e-folder-preview-link-to-settings"
        >
          <Box display="flex" alignItems="center" gap="4px">
            <Icon name="folder-solid" fill={colors.coolGrey600} width="14px" />
            <Text color="coolGrey600" m="0px" fontSize="s" p="0">
              {truncate(
                localize(projectFolder.data.attributes.title_multiloc),
                40
              )}
            </Text>
          </Box>
        </Link>
        <Button
          onClick={() => {
            setIsProjectListOpen(!isProjectListOpen);
          }}
          data-cy="e2e-folder-preview-button"
          buttonStyle="text"
          iconSize="20px"
          p="0px"
          ml="4px"
          icon={isProjectListOpen ? 'chevron-up' : 'chevron-down'}
        />
        <Dropdown
          opened={isProjectListOpen}
          content={
            <Box
              display="flex"
              flexDirection="column"
              gap="8px"
              maxHeight="200px"
              overflow="auto"
            >
              {siblingProjects?.pages[0].data.map((project) => (
                <ButtonWithLink
                  key={project.id}
                  linkTo={`/admin/projects/${project.relationships.publication.data.id}`}
                  openLinkInNewTab={true}
                  buttonStyle="text"
                  p="4px"
                  justify="left"
                >
                  <Text
                    fontSize="s"
                    m="0px"
                    color="coolGrey600"
                    textAlign="left"
                  >
                    {localize(project.attributes.publication_title_multiloc)}
                  </Text>
                </ButtonWithLink>
              ))}
            </Box>
          }
          top="36px"
          maxHeight="400px"
          zIndex="10000"
          width="300px"
        />
      </Box>
    </Box>
  );
};

export default LinkToFolderSettings;
