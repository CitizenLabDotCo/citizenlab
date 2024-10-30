import React, { memo, KeyboardEvent, useRef } from 'react';

import {
  fontSizes,
  media,
  Icon,
  useBreakpoint,
  IconNames,
} from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ITab } from 'typings';

import useEventsByUserId from 'api/events/useEventsByUserId';
import useAuthUser from 'api/me/useAuthUser';
import useUserCommentsCount from 'api/user_comments_count/useUserCommentsCount';
import useUserIdeasCount from 'api/user_ideas_count/useUserIdeasCount';
import { IUserData } from 'api/users/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';

import messages from './messages';

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

interface TabData
  extends Omit<ITab, 'name' | 'url' | 'feature' | 'statusLabel' | 'active'> {
  path: 'submissions' | 'comments' | 'following' | 'events';
  className?: string;
  icon: IconNames;
  active: boolean;
}

const UserNavbar = memo<Props>(({ user }) => {
  const { data: ideasCount } = useUserIdeasCount({ userId: user.id });
  const tabsRef = useRef({});
  const { formatMessage } = useIntl();
  const isSmallerThanPhone = useBreakpoint('phone');
  const { pathname } = useLocation();
  const { data: commentsCount } = useUserCommentsCount({
    userId: user.id,
  });
  const { data: events } = useEventsByUserId(user.id);
  const { data: authUser } = useAuthUser();

  const eventsCount = events?.data.length;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const showEventTab = authUser?.data?.id === user.id;
  const isFollowingEnabled = useFeatureFlag({
    name: 'follow',
  });
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const showFollowingTab = isFollowingEnabled && authUser?.data?.id === user.id;

  const followingTab: TabData = {
    label: formatMessage(messages.followingWithCount, {
      followingCount: authUser?.data.attributes.followings_count || 0,
    }),
    active: pathname.endsWith('following'),
    path: 'following',
    icon: 'notification-outline',
    className: 'e2e-following-tab',
  };
  const eventsTab: TabData = {
    label: formatMessage(messages.eventsWithCount, {
      eventsCount: eventsCount || 0,
    }),
    active: pathname.endsWith('events'),
    path: 'events',
    icon: 'calendar',
    className: 'e2e-events-nav',
  };

  const tabs: TabData[] = [
    {
      label: formatMessage(messages.postsWithCount, {
        ideasCount: ideasCount?.data.attributes.count || 0,
      }),
      active: pathname.endsWith('submissions'),
      path: 'submissions',
      icon: 'idea',
    },
    {
      label: formatMessage(messages.commentsWithCount, {
        commentsCount: commentsCount?.data.attributes.count || 0,
      }),
      active: pathname.endsWith('comments'),
      path: 'comments',
      icon: 'comments',
      className: 'e2e-comment-section-nav',
    },
    ...(showFollowingTab ? [followingTab] : []),
    ...(showEventTab ? [eventsTab] : []),
  ];

  const handleKeyDownTab = (
    { key }: KeyboardEvent<HTMLButtonElement>,
    path: string
  ) => {
    if (key !== 'ArrowLeft' && key !== 'ArrowRight') return;

    const currentTabIndex = tabs.findIndex((tabData) => tabData.path === path);
    let nextTabIndex: number;

    if (key === 'ArrowLeft') {
      nextTabIndex =
        currentTabIndex === 0 ? tabs.length - 1 : currentTabIndex - 1;
    } else {
      nextTabIndex =
        currentTabIndex === tabs.length - 1 ? 0 : currentTabIndex + 1;
    }
    const nextTab = tabs[nextTabIndex];

    clHistory.push(`/profile/${user.attributes.slug}/${nextTab.path}`);
    tabsRef.current[nextTab.path].focus();
  };

  return (
    <UserNavbarWrapper role="tablist">
      {tabs.map((tab) => (
        <UserNavbarButton
          key={tab.path}
          onMouseDown={removeFocusAfterMouseClick}
          onClick={() =>
            clHistory.push(`/profile/${user.attributes.slug}/${tab.path}`)
          }
          className={`${tab.className || ''} ${tab.active ? 'active' : ''}`}
          role="tab"
          aria-selected={tab.active}
          data-cy={tab.className}
          // Allow tabbing to active tab. The other tabs can be accessed with the arrow keys.
          tabIndex={tab.active ? 0 : -1}
          onKeyDown={(event) => handleKeyDownTab(event, tab.path)}
          ref={(el) => el && (tabsRef.current[tab.path] = el)}
          aria-controls={`tab-${tab.path}`}
        >
          <Border aria-hidden />
          <TabIcon name={tab.icon} ariaHidden />
          {isSmallerThanPhone ? (
            <ScreenReaderOnly>{tab.label}</ScreenReaderOnly>
          ) : (
            tab.label
          )}
        </UserNavbarButton>
      ))}
    </UserNavbarWrapper>
  );
});

export default UserNavbar;
