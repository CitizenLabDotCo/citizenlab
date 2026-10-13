import React from 'react';

import {
  Box,
  IconButton,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useDeleteProjectModerator from 'api/project_moderators/useDeleteProjectModerator';
import useProjectModerators from 'api/project_moderators/useProjectModerators';

import InviteBadge from 'containers/Admin/invitations/all/InviteBadge';

import moderatorsTableMessages from 'components/admin/ModeratorsTable/messages';
import Avatar from 'components/Avatar';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';
import { getFullName } from 'utils/textUtils';

interface Props {
  projectId: string;
}

const ManagersList = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const { data: moderators } = useProjectModerators({ projectId });
  const { mutate: deleteProjectModerator } = useDeleteProjectModerator();

  if (!authUser || !moderators) return null;

  if (moderators.data.length === 0) {
    return (
      <Text variant="boMicro" color="coolGrey700" m="0px">
        {formatMessage(moderatorsTableMessages.noManagers)}
      </Text>
    );
  }

  return (
    <Box as="ul" display="flex" flexDirection="column" m="0px" p="0px">
      {moderators.data.map((moderator) => {
        // Managers can't remove themselves; only an admin can.
        const canRemove =
          moderator.id !== authUser.data.id || isAdmin(authUser);

        return (
          <Box
            as="li"
            key={moderator.id}
            display="flex"
            alignItems="center"
            gap="8px"
            minHeight="40px"
            borderBottom={`1px solid ${colors.grey100}`}
          >
            <Avatar userId={moderator.id} size={20} />
            <Box flex="1" minWidth="0">
              <Text
                variant="boMicro"
                color="textPrimary"
                m="0px"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {getFullName(moderator)}
              </Text>
            </Box>
            <InviteBadge user={moderator} />
            {canRemove && (
              <IconButton
                iconName="close"
                iconWidth="16px"
                iconHeight="16px"
                iconColor={colors.coolGrey500}
                iconColorOnHover={colors.coolGrey700}
                a11y_buttonActionMessage={formatMessage(
                  moderatorsTableMessages.removeManager
                )}
                onClick={() =>
                  deleteProjectModerator({ projectId, userId: moderator.id })
                }
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default ManagersList;
