import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetUserStats, { GetUserStatsChildProps } from 'resources/GetUserStats';

// styles
import { fontSizes, media, colors } from 'utils/styleUtils';
import styled from 'styled-components';
import { rgba } from 'polished';

// components
import Icon from 'components/UI/Icon';
import { UserTab } from './';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const UserNavbarWrapper = styled.nav`
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
    top: 0;
  `}
`;

const UserNavbarButton = styled.ul`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease;
  border-top: 3px solid transparent;
  border-bottom: 3px solid transparent;
  height: 100%;
  position: relative;
  margin: 0px;
  cursor: pointer;

  &:focus,
  &:hover {
    color: ${({ theme }) => theme.colorText};
    border-top-color: ${({ theme }) => rgba(theme.colorMain, 0.3)};
  }

  &.active {
    border-top-color: ${({ theme }) => theme.colorMain};
    border-bottom-color: ${({ theme }) => rgba(theme.colorMain, 0.05)};

    &:before {
      content: "";
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
  height: 20px;
  margin-right: 8px;
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

const UserNavbar = memo<Props>(props => {
  const { currentTab, selectTab, ideasCount, commentsCount } = props;
  return (
    <UserNavbarWrapper>
      <UserNavbarButton
        onClick={selectTab('ideas')}
        className={currentTab === 'ideas' ? 'active' : ''}
      >
        <TabIcon name="lightBulb" />
        {!isNilOrError(ideasCount) &&
          <FormattedMessage {...messages.ideasWithCount} values={{ ideasCount }} />
        }
      </UserNavbarButton>
      <UserNavbarButton
        onClick={selectTab('comments')}
        className={currentTab === 'comments' ? 'active' : ''}
      >
        <TabIcon name="bubbles" />
        {!isNilOrError(commentsCount) &&
          <FormattedMessage {...messages.commentsWithCount} values={{ commentsCount }} />
        }
      </UserNavbarButton>
    </UserNavbarWrapper>
  );
});

const Data = adopt<DataProps, InputProps>({
  ideasCount: ({ userId, render }) => <GetUserStats userId={userId} resource="ideas">{render}</GetUserStats>,
  commentsCount: ({ userId, render }) => <GetUserStats userId={userId} resource="comments">{render}</GetUserStats>
});

const WrappedUserNavbar = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <UserNavbar {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedUserNavbar;
