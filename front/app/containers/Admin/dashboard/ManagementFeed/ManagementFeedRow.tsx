import React from 'react';

import { Tr, Td, Box } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import { ManagementFeedData } from 'api/management_feed/types';
import useUserById from 'api/users/useUserById';

import useLocalize from 'hooks/useLocalize';

import Avatar from 'components/Avatar';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { getFullName } from 'utils/textUtils';

const ManagementFeedRow = ({ item }: { item: ManagementFeedData }) => {
  const localize = useLocalize();
  const { formatMessage, formatDate } = useIntl();
  const { data: user } = useUserById(item.relationships.user.data?.id);

  const getLink: () => RouteType = () => {
    if (item.attributes.action === 'deleted') return '';
    if (item.attributes.item_type === 'project') {
      return `/admin/projects/${item.attributes.item_id}`;
    } else if (item.attributes.item_type === 'phase') {
      return `/admin/projects/${item.attributes.project_id}/phases/${item.attributes.item_id}`;
    } else if (item.attributes.item_type === 'folder') {
      return `/admin/projects/folders/${item.attributes.item_id}/projects`;
    } else if (item.attributes.item_type === 'idea') {
      return `/ideas/${item.attributes.item_slug}`;
    }
    return '';
  };
  return (
    <Tr key={item.id}>
      <Td>{formatDate(item.attributes.acted_at)}</Td>
      <Td>
        {user && (
          <Box display="flex" gap="8px" alignItems="center">
            <Avatar userId={user?.data.id} size={24} />
            {getFullName(user.data)}
          </Box>
        )}
      </Td>
      <Td>
        <Box>
          {getLink() ? (
            <Link target="_blank" to={getLink()}>
              {localize(item.attributes.item_title_multiloc)}
            </Link>
          ) : (
            localize(item.attributes.item_title_multiloc)
          )}
          <br />
          {item.attributes.item_type}
        </Box>
      </Td>
      <Td>{item.attributes.action}</Td>
    </Tr>
  );
};

export default ManagementFeedRow;
