import React, { memo } from 'react';
import { useLocation } from 'react-router-dom';

import { removeFocusAfterMouseClick } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// styles
import { fontSizes, media } from 'utils/styleUtils';
import styled from 'styled-components';
import { rgba } from 'polished';

// components
import { Icon, useBreakpoint } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useUserIdeasCount from 'api/user_ideas_count/useUserIdeasCount';
import useUserCommentsCount from 'api/user_comments_count/useUserCommentsCount';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAuthUser from 'api/me/useAuthUser';
import useEventsByUserId from 'api/events/useEventsByUserId';
import { ScreenReaderOnly } from 'utils/a11y';
import { IUserData } from 'api/users/types';

const UserNavbarWrapper = styled.div`
  width: 100%;
  background-color: white;
  position: sticky;
  top: ${({ theme }) => theme.menuHeight}px;
  left: 0;
  z-index: 10;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.03);
  border-top: 1px solid rgba(0, 0, 0, 0.03);
  display: flex;
  justify-content: center;
  height: 54px;

  ${media.tablet`
    top: 0px;
  `}
`;

const Border = styled.div`
  height: 3px;
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  background: transparent;
`;

const UserNavbarButton = styled.button`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease;
  white-space: nowrap;
  height: 100%;
  position: relative;
  margin: 0px;
  cursor: pointer;

  &:focus,
  &:hover {
    color: ${({ theme }) => theme.colors.tenantText};

    ${Border} {
      background: ${({ theme }) => rgba(theme.colors.tenantPrimary, 0.3)};
    }
  }

  &.active {
    ${Border} {
      background: ${({ theme }) => theme.colors.tenantPrimary};
    }

    &:before {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: -1;
      background-color: ${({ theme }) =>
        rgba(theme.colors.tenantPrimary, 0.05)};
      pointer-events: none;
    }
  }

  ${media.phone`
    flex: 1;
  `}
`;

const TabIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.tenantText};
  margin-right: 10px;
`;

interface Props {
  user: IUserData;
}

const UserNavbar = memo<Props>(({ user }) => {
  const { data: ideasCount } = useUserIdeasCount({ userId: user.id });
  const isSmallerThanPhone = useBreakpoint('phone');
  const { pathname } = useLocation();
  const { data: commentsCount } = useUserCommentsCount({
    userId: user.id,
  });
  const { data: events } = useEventsByUserId(user.id);
  const { data: authUser } = useAuthUser();

  const eventsCount = events?.data.length;
  // const showEventTab = authUser?.data?.id === userId; // TODO: Re-enable once event attendance smart group added
  const showEventTab = false;
  const isFollowingEnabled = useFeatureFlag({
    name: 'follow',
  });
  const showFollowingTab = isFollowingEnabled && authUser?.data?.id === user.id;

  return (
    <UserNavbarWrapper role="tablist">
      <UserNavbarButton
        onMouseDown={removeFocusAfterMouseClick}
        onClick={() =>
          clHistory.push(`/profile/${user.attributes.slug}/submissions`)
        }
        className={pathname.endsWith('submissions') ? 'active' : ''}
        role="tab"
        aria-selected={pathname.endsWith('submissions')}
      >
        <Border aria-hidden />
        <TabIcon name="idea" ariaHidden />
        {!isSmallerThanPhone && (
          <FormattedMessage
            {...messages.postsWithCount}
            values={{ ideasCount: ideasCount?.data.attributes.count || '0' }}
          />
        )}
        {isSmallerThanPhone && (
          <ScreenReaderOnly>
            <FormattedMessage
              {...messages.postsWithCount}
              values={{ ideasCount: ideasCount?.data.attributes.count || '0' }}
            />
          </ScreenReaderOnly>
        )}
        {isSmallerThanPhone && (
          <ScreenReaderOnly>
            <FormattedMessage
              {...messages.postsWithCount}
              values={{ ideasCount: ideasCount?.data.attributes.count || '0' }}
            />
          </ScreenReaderOnly>
        )}
      </UserNavbarButton>
      <UserNavbarButton
        onMouseDown={removeFocusAfterMouseClick}
        onClick={() =>
          clHistory.push(`/profile/${user.attributes.slug}/comments`)
        }
        className={`e2e-comment-section-nav ${
          pathname.endsWith('comments') ? 'active' : ''
        }`}
        role="tab"
        aria-selected={pathname.endsWith('comments')}
      >
        <Border aria-hidden />
        <TabIcon name="comments" ariaHidden />
        {!isSmallerThanPhone && (
          <FormattedMessage
            {...messages.commentsWithCount}
            values={{
              commentsCount: commentsCount?.data.attributes.count || '0',
            }}
          />
        )}
        {isSmallerThanPhone && (
          <ScreenReaderOnly>
            <FormattedMessage
              {...messages.commentsWithCount}
              values={{
                commentsCount: commentsCount?.data.attributes.count || '0',
              }}
            />
          </ScreenReaderOnly>
        )}
      </UserNavbarButton>
      {showFollowingTab && (
        <UserNavbarButton
          onMouseDown={removeFocusAfterMouseClick}
          onClick={() =>
            clHistory.push(`/profile/${user.attributes.slug}/following`)
          }
          className={pathname.endsWith('following') ? 'active' : ''}
          role="tab"
          aria-selected={pathname.endsWith('following')}
          data-cy="e2e-following-tab"
        >
          <Border aria-hidden />
          <TabIcon name="notification-outline" ariaHidden />
          {!isSmallerThanPhone && (
            <FormattedMessage
              {...messages.followingWithCount}
              values={{
                followingCount: authUser?.data.attributes.followings_count,
              }}
            />
          )}
          {isSmallerThanPhone && (
            <ScreenReaderOnly>
              <FormattedMessage
                {...messages.followingWithCount}
                values={{
                  followingCount: authUser?.data.attributes.followings_count,
                }}
              />
            </ScreenReaderOnly>
          )}
        </UserNavbarButton>
      )}
      {showEventTab && (
        <UserNavbarButton
          onMouseDown={removeFocusAfterMouseClick}
          onClick={() =>
            clHistory.push(`/profile/${user.attributes.slug}/events`)
          }
          className={`e2e-events-nav ${
            pathname.endsWith('events') ? 'active' : ''
          }`}
          role="tab"
          aria-selected={pathname.endsWith('events')}
        >
          <Border aria-hidden />
          <TabIcon name="calendar" ariaHidden />
          {!isSmallerThanPhone && (
            <FormattedMessage
              {...messages.eventsWithCount}
              values={{ eventsCount: eventsCount || '0' }}
            />
          )}
          {isSmallerThanPhone && (
            <ScreenReaderOnly>
              <FormattedMessage
                {...messages.eventsWithCount}
                values={{ eventsCount: eventsCount || '0' }}
              />
            </ScreenReaderOnly>
          )}
        </UserNavbarButton>
      )}
    </UserNavbarWrapper>
  );
});

export default UserNavbar;
