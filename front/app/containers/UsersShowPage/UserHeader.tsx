import React, { useState } from 'react';

import { isEmpty, forOwn } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import { isAdmin } from 'services/permissions/roles';

// components
import Avatar from 'components/Avatar';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import Button from 'components/UI/Button';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import {
  Badge,
  useBreakpoint,
  Box,
  Title,
  Text,
} from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

// i18n
import { useIntl } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';
import blockUserMessages from 'components/admin/UserBlockModals/messages';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAuthUser from 'hooks/useAuthUser';
import useUser from 'hooks/useUser';

const BlockUser = React.lazy(
  () => import('components/admin/UserBlockModals/BlockUser')
);
const UnblockUser = React.lazy(
  () => import('components/admin/UserBlockModals/UnblockUser')
);

const Bio = styled.div`
  line-height: 1.25;
  max-width: 600px;
  text-align: center;
  font-weight: 400;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 20px;
`;

interface Props {
  userSlug: string | null;
}

const UserHeader = ({ userSlug }: Props) => {
  const authUser = useAuthUser();
  const user = useUser({ slug: userSlug });
  const isSmallerThanTablet = useBreakpoint('tablet');
  const hideBio = useFeatureFlag({ name: 'disable_user_bios' });
  const isUserBlockingEnabled = useFeatureFlag({
    name: 'user_blocking',
  });
  const { formatMessage } = useIntl();
  const [showBlockUserModal, setShowBlockUserModal] = useState(false);
  const [showUnblockUserModal, setShowUnblockUserModal] = useState(false);

  if (isNilOrError(user)) {
    return null;
  }
  const memberSinceMoment = moment(user.attributes.created_at).format('LL');
  let hasDescription = false;

  forOwn(user.attributes.bio_multiloc, (value, _key) => {
    if (!isEmpty(value) && value !== '<p></p>' && value !== '<p><br></p>') {
      hasDescription = true;
    }
  });

  const isBlocked = user.attributes?.blocked;
  const isCurrentUserAdmin =
    !isNilOrError(authUser) && isAdmin({ data: authUser });
  const canBlock = isCurrentUserAdmin && user.id !== authUser?.id;

  const userBlockingRelatedActions: IAction[] = isUserBlockingEnabled
    ? [
        isBlocked
          ? {
              handler: () => setShowUnblockUserModal(true),
              label: formatMessage(blockUserMessages.unblockAction),
              icon: 'user-circle' as const,
            }
          : {
              handler: () => setShowBlockUserModal(true),
              label: formatMessage(blockUserMessages.blockAction),
              icon: 'halt' as const,
            },
      ]
    : [];

  return (
    <Box
      bgColor="white"
      width="100%"
      p={isSmallerThanTablet ? '20px 20px 35px' : '30px 0px 70px'}
      data-testid="userHeader"
    >
      <Box w="100%" display="flex" justifyContent="center" mb="40px">
        <Avatar userId={user.id} size={isSmallerThanTablet ? 120 : 150} />
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        w="100%"
        mt="0px"
      >
        {isCurrentUserAdmin && isBlocked && (
          <Tippy
            interactive={true}
            placement={'top'}
            theme={'dark'}
            content={formatMessage(blockUserMessages.bocknigInfo, {
              from: moment(user.attributes.block_start_at).format('LL'),
              to: moment(user.attributes.block_end_at).format('LL'),
            })}
          >
            <Badge color={colors.error}>
              {formatMessage(blockUserMessages.blocked)}
            </Badge>
          </Tippy>
        )}
        <Box display="flex" alignItems="center" color="tenantText">
          <Title id="e2e-usersshowpage-fullname" color="tenantText" mr="10px">
            {user.attributes.first_name} {user.attributes.last_name}
          </Title>
          {isCurrentUserAdmin && canBlock && (
            <MoreActionsMenu
              showLabel={false}
              actions={userBlockingRelatedActions}
            />
          )}
        </Box>
        <Text color="tenantText">
          {formatMessage(messages.memberSince, { date: memberSinceMoment })}
        </Text>
        {!hideBio &&
          !isEmpty(user.attributes.bio_multiloc) &&
          hasDescription && (
            <Bio data-testid="userHeaderBio">
              <QuillEditedContent>
                {user.attributes.bio_multiloc && (
                  <T value={user.attributes.bio_multiloc} supportHtml={true} />
                )}
              </QuillEditedContent>
            </Bio>
          )}
        {!isNilOrError(authUser) && authUser.id === user.id && (
          <Button
            linkTo="/profile/edit"
            buttonStyle="text"
            icon="edit"
            className="e2e-edit-profile"
            bgHoverColor={colors.background}
          >
            {formatMessage(messages.editProfile)}
          </Button>
        )}
        {isCurrentUserAdmin && (
          <>
            <BlockUser
              user={user}
              setClose={() => setShowBlockUserModal(false)}
              open={showBlockUserModal}
            />
            <UnblockUser
              user={user}
              setClose={() => setShowUnblockUserModal(false)}
              open={showUnblockUserModal}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default UserHeader;
