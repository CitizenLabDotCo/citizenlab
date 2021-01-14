import React, { memo, useCallback, MouseEvent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetUserStats, { GetUserStatsChildProps } from 'resources/GetUserStats';

// styles
import { fontSizes, media } from 'utils/styleUtils';
import styled from 'styled-components';
import { rgba } from 'polished';

// components
import { Icon } from 'cl2-component-library';
import { UserTab } from './';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
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

  ${media.smallerThanMaxTablet`
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
  color: ${({ theme }) => theme.colorText};
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
    color: ${({ theme }) => theme.colorText};

    ${Border} {
      background: ${({ theme }) => rgba(theme.colorMain, 0.3)};
    }
  }

  &.active {
    ${Border} {
      background: ${({ theme }) => theme.colorMain};
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
      background-color: ${({ theme }) => rgba(theme.colorMain, 0.05)};
      pointer-events: none;
    }
  }

  ${media.smallerThanMinTablet`
    flex: 1;
  `}
`;

const TabIcon = styled(Icon)`
  color: ${({ theme }) => theme.colorText};
  height: 22px;
  margin-right: 10px;
`;

interface InputProps {
  currentTab: UserTab;
  selectTab: (tab: UserTab) => () => void;
  userId: string;
}

interface DataProps {
  ideasCount: GetUserStatsChildProps;
  commentsCount: GetUserStatsChildProps;
}

interface Props extends InputProps, DataProps {}

const UserNavbar = memo<Props>((props) => {
  const { currentTab, selectTab, ideasCount, commentsCount } = props;

  const removeFocus = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  return (
    <UserNavbarWrapper role="tablist">
      <UserNavbarButton
        onMouseDown={removeFocus}
        onClick={selectTab('ideas')}
        className={currentTab === 'ideas' ? 'active' : ''}
        role="tab"
        aria-selected={currentTab === 'ideas'}
      >
        <Border aria-hidden />
        <TabIcon name="idea" ariaHidden />
        {!isNilOrError(ideasCount) && (
          <FormattedMessage
            {...messages.postsWithCount}
            values={{ ideasCount }}
          />
        )}
      </UserNavbarButton>
      <UserNavbarButton
        onMouseDown={removeFocus}
        onClick={selectTab('comments')}
        className={`e2e-comment-section-nav ${
          currentTab === 'comments' ? 'active' : ''
        }`}
        role="tab"
        aria-selected={currentTab === 'comments'}
      >
        <Border aria-hidden />
        <TabIcon name="comments" ariaHidden />
        {!isNilOrError(commentsCount) && (
          <FormattedMessage
            {...messages.commentsWithCount}
            values={{ commentsCount }}
          />
        )}
      </UserNavbarButton>
    </UserNavbarWrapper>
  );
});

const Data = adopt<DataProps, InputProps>({
  ideasCount: ({ userId, render }) => (
    <GetUserStats userId={userId} resource="ideas">
      {render}
    </GetUserStats>
  ),
  commentsCount: ({ userId, render }) => (
    <GetUserStats userId={userId} resource="comments">
      {render}
    </GetUserStats>
  ),
});

const WrappedUserNavbar = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <UserNavbar {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedUserNavbar;
