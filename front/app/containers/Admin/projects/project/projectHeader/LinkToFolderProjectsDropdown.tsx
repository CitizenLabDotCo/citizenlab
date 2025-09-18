import React, { useState } from 'react';

import { Text, Box, Button, Dropdown } from '@citizenlab/cl2-component-library';

import useAdminPublications from 'api/admin_publications/useAdminPublications';

import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';

type Props = {
  folderId: string;
};

const LinkToFolderProjectsDropdown = ({ folderId }: Props) => {
  const localize = useLocalize();
  const [isProjectListOpen, setIsProjectListOpen] = useState(false);

  const { data: siblingProjects } = useAdminPublications({
    childrenOfId: folderId,
  });

  return (
    <>
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
                <Text fontSize="s" m="0px" color="coolGrey600" textAlign="left">
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
    </>
  );
};

export default LinkToFolderProjectsDropdown;
