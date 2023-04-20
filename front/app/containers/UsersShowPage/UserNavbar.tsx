import React, { memo } from 'react';

import { removeFocusAfterMouseClick } from 'utils/helperUtils';

// styles
import { fontSizes, media } from 'utils/styleUtils';
import styled from 'styled-components';
import { rgba } from 'polished';

// components
import { Icon } from '@citizenlab/cl2-component-library';
import { UserTab } from './';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// api
import useUserIdeasCount from 'api/user_ideas_count/useUserIdeasCount';
import useUserCommentsCount from 'api/user_comments_count/useUserCommentsCount';

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
  currentTab: UserTab;
  selectTab: (tab: UserTab) => () => void;
  userId: string;
}

const UserNavbar = memo<Props>(({ currentTab, selectTab, userId }) => {
  const { data: ideasCount } = useUserIdeasCount({ userId });
  const { data: commentsCount } = useUserCommentsCount({
    userId,
  });

  return (
    <UserNavbarWrapper role="tablist">
      <UserNavbarButton
        onMouseDown={removeFocusAfterMouseClick}
        onClick={selectTab('ideas')}
        className={currentTab === 'ideas' ? 'active' : ''}
        role="tab"
        aria-selected={currentTab === 'ideas'}
      >
        <Border aria-hidden />
        <TabIcon name="idea" ariaHidden />
        {ideasCount && (
          <FormattedMessage
            {...messages.postsWithCount}
            values={{ ideasCount: ideasCount.data.attributes.count }}
          />
        )}
      </UserNavbarButton>
      <UserNavbarButton
        onMouseDown={removeFocusAfterMouseClick}
        onClick={selectTab('comments')}
        className={`e2e-comment-section-nav ${
          currentTab === 'comments' ? 'active' : ''
        }`}
        role="tab"
        aria-selected={currentTab === 'comments'}
      >
        <Border aria-hidden />
        <TabIcon name="comments" ariaHidden />
        {commentsCount && (
          <FormattedMessage
            {...messages.commentsWithCount}
            values={{ commentsCount: commentsCount.data.attributes.count }}
          />
        )}
      </UserNavbarButton>
    </UserNavbarWrapper>
  );
});

export default UserNavbar;
