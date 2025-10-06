import React, { useState } from 'react';

import {
  Text,
  Box,
  Button,
  Dropdown,
  Icon,
  truncate,
  colors,
} from '@citizenlab/cl2-component-library';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';

interface Props {
  folderId: string;
}

export const fragmentId = 'folder';

const FolderProjectDropdown = ({ folderId }: Props) => {
  const { data: projectFolder } = useProjectFolderById(folderId);

  const localize = useLocalize();
  const [isProjectListOpen, setIsProjectListOpen] = useState(false);

  const { data: siblingProjects } = useAdminPublications({
    childrenOfId: folderId,
  });

  return (
    <Box position="relative">
      <Box display="flex">
        <>
          <Button
            onClick={() => {
              setIsProjectListOpen(!isProjectListOpen);
            }}
            buttonStyle="text"
            iconSize="20px"
            p="0px"
            icon={isProjectListOpen ? 'chevron-up' : 'chevron-down'}
            iconPos="right"
            data-cy="e2e-folder-preview-open-projects-dropdown"
          >
            <Box display="flex" alignItems="center" gap="4px">
              <Icon
                name="folder-solid"
                fill={colors.coolGrey600}
                width="14px"
              />
              <Text color="coolGrey600" m="0px" fontSize="s" p="0">
                {truncate(
                  localize(projectFolder?.data.attributes.title_multiloc),
                  40
                )}
              </Text>
            </Box>
          </Button>
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
                {siblingProjects?.pages.map((page) =>
                  page.data.map((adminPublication) => (
                    <ButtonWithLink
                      key={adminPublication.id}
                      linkTo={`/admin/projects/${adminPublication.relationships.publication.data.id}`}
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
                        {localize(
                          adminPublication.attributes.publication_title_multiloc
                        )}
                      </Text>
                    </ButtonWithLink>
                  ))
                )}
              </Box>
            }
            top="36px"
            maxHeight="400px"
            zIndex="10000"
            width="300px"
          />
        </>
      </Box>
    </Box>
  );
};

export default FolderProjectDropdown;
