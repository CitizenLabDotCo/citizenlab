import React, { memo } from 'react';
// import { adopt } from 'react-adopt';
// import { isNilOrError } from 'utils/helperUtils';

// resources

// styles
import { fontSizes, media, colors } from 'utils/styleUtils';
import styled from 'styled-components';
import { rgba } from 'polished';

// components
import Icon from 'components/UI/Icon';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import { UserTab } from './';

const UserNavbarWrapper = styled.nav`
  width: 100%;
  background-color: white;
  position: fixed; /* IE11 fallback */
  position: sticky;
  top: ${({ theme }) => theme.menuHeight}px;
  z-index: 10;
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.06);
  border-top: 1px solid ${colors.background};
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
}

interface DataProps {
}

interface Props extends InputProps, DataProps {}

const UserNavbar = memo<Props>(props => {
  const { currentTab, selectTab } = props;
  return (
    <UserNavbarWrapper>
      <UserNavbarButton
        onClick={selectTab('ideas')}
        className={currentTab === 'ideas' ? 'active' : ''}
      >
        <TabIcon name="lightBulb" />
        <FormattedMessage {...messages.ideasWithCount} values={{ count: 0 }} />
      </UserNavbarButton>
      <UserNavbarButton
        onClick={selectTab('comments')}
        className={currentTab === 'comments' ? 'active' : ''}
      >
        <TabIcon name="bubbles" />
        <FormattedMessage {...messages.commentsWithCount} values={{ count: 0 }} />
      </UserNavbarButton>
    </UserNavbarWrapper>
  );
});

export default UserNavbar;

// leaving that in case the counters are on the stats endpoint
// const Data = adopt<DataProps, InputProps>({
// });
//
// export default (inputProps: InputProps) => (
//   <Data {...inputProps}>
//     {dataProps => <UserNavbar {...inputProps} {...dataProps} />}
//   </Data>
// );
