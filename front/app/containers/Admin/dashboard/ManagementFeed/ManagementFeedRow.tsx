import React, { useState } from 'react';

import {
  Tr,
  Td,
  Box,
  Button,
  fontSizes,
  Text,
} from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import { ManagementFeedData } from 'api/management_feed/types';
import useProjectById from 'api/projects/useProjectById';
import useUserById from 'api/users/useUserById';

import useLocalize from 'hooks/useLocalize';

import Avatar from 'components/Avatar';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { getFullName } from 'utils/textUtils';

import ChangesTables from './ChangesTables';
import messages from './messages';

const ManagementFeedRow = ({ item }: { item: ManagementFeedData }) => {
  const [isChangedModalOpened, setIsChangedModalOpened] = useState(false);
  const localize = useLocalize();
  const { formatMessage, formatDate, formatTime } = useIntl();
  const { data: user } = useUserById(item.relationships.user.data?.id);
  const { data: project } = useProjectById(item.attributes.project_id);

  const getActionTranslation = () => {
    switch (item.attributes.action) {
      case 'created':
        return formatMessage(messages.created);
      case 'changed':
        return formatMessage(messages.changed);
      case 'deleted':
        return formatMessage(messages.deleted);
      default:
        return item.attributes.action;
    }
  };

  const getItemTranslation = () => {
    switch (item.attributes.item_type) {
      case 'idea':
        return formatMessage(messages.idea);
      case 'phase':
        return formatMessage(messages.phase);
      case 'project':
        return formatMessage(messages.project);
      case 'folder':
        return formatMessage(messages.folder);
      default:
        return item.attributes.item_type;
    }
  };

  const getLink: () => RouteType = () => {
    if (!item.attributes.item_exists) return '';
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
    <>
      <Tr key={item.id}>
        <Td>
          {formatDate(item.attributes.acted_at)}
          <br />
          {formatTime(item.attributes.acted_at)}
        </Td>
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
            {getLink() && item.attributes.item_exists ? (
              <Link target="_blank" to={getLink()}>
                {localize(item.attributes.item_title_multiloc)}
              </Link>
            ) : (
              localize(item.attributes.item_title_multiloc)
            )}
            <br />
            <Text fontSize="s" m="0px">
              {getItemTranslation()}{' '}
              {(item.attributes.item_type === 'idea' ||
                item.attributes.item_type === 'phase') &&
                project && (
                  <FormattedMessage
                    {...messages.in}
                    values={{
                      project: (
                        <Link to={`/admin/projects/${project.data.id}`}>
                          {localize(project.data.attributes.title_multiloc)}
                        </Link>
                      ),
                    }}
                  />
                )}
            </Text>
          </Box>
        </Td>
        <Td>
          {getActionTranslation()}
          {item.attributes.action === 'changed' && item.attributes.change && (
            <Button
              buttonStyle="text"
              icon="chevron-down"
              iconPos="right"
              w="fit-content"
              p="0px"
              iconSize="18px"
              fontSize={`${fontSizes.s}px`}
              onClick={() => setIsChangedModalOpened(true)}
            >
              {formatMessage(messages.viewDetails)}
            </Button>
          )}
        </Td>
      </Tr>
      <Modal
        opened={isChangedModalOpened}
        close={() => setIsChangedModalOpened(false)}
        width="1000px"
      >
        <ChangesTables changes={item.attributes.change} />
      </Modal>
    </>
  );
};

export default ManagementFeedRow;
