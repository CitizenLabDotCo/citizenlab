import React from 'react';

import { Title, Icon, colors, Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { IUserData } from 'api/users/types';

import useLocalize from 'hooks/useLocalize';

import Divider from 'components/admin/Divider';

import Link from 'utils/cl-router/Link';

const StyledLink = styled(Link)`
  color: ${colors.textSecondary};
  text-decoration: underline;
  &:hover {
    color: ${colors.textPrimary};
`;

const UserAssignedItems = ({ user }: { user: IUserData }) => {
  const localize = useLocalize();
  const { data: assignedItems } = useAdminPublications({});
  const flatAssignedItems = assignedItems?.pages?.flatMap((page) => page.data);
  const isFolder = (item: IAdminPublicationData) =>
    item.relationships.publication.data.type === 'folder';
  return (
    <div>
      <Title m="0px">UserAssignedItems</Title>
      <Divider />
      {flatAssignedItems?.map((item) => (
        <Box
          key={item.id}
          display="flex"
          alignItems="center"
          gap="4px"
          py="4px"
        >
          {isFolder(item) && (
            <Icon name="folder-solid" fill={colors.textSecondary} />
          )}
          <StyledLink
            to={
              isFolder(item)
                ? `/folders/${item.attributes.publication_slug}`
                : `/projects/${item.attributes.publication_slug}`
            }
            target="_blank"
          >
            {localize(item.attributes.publication_title_multiloc)}
          </StyledLink>
        </Box>
      ))}
    </div>
  );
};

export default UserAssignedItems;
