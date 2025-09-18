import React from 'react';

import { Text, Box, Dropdown } from '@citizenlab/cl2-component-library';

import useAdminPublications from 'api/admin_publications/useAdminPublications';

import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';

type Props = {
  folderId: string;
  isProjectListOpen: boolean;
  setIsProjectListOpen: (isOpen: boolean) => void;
};

const LinkToFolderProjectDropdown = ({
  folderId,
  isProjectListOpen,
}: Props) => {
  const localize = useLocalize();
  const { data: siblingProjects } = useAdminPublications({
    childrenOfId: folderId,
  });

  return (
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
  );
};

export default LinkToFolderProjectDropdown;
