import * as React from 'react';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import Icon from 'components/UI/Icon';
import messages from '../../messages';

const Container = styled.div`
  height: ${(props) => props.theme.mobileMenuHeight}px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  box-shadow: 0px -1px 3px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: stretch;
  justify-content: space-evenly;
  z-index: 10000;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const NavigationIconWrapper = styled.div`
  width: 100%;
  flex: 0 0 38px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavigationIcon = styled(Icon)`
  fill: #999;
  height: 26px;
`;

const NavigationLabel = styled.div`
  width: 100%;
  height: 18px;
  color: #999;
  font-size: 14px;
  font-weight: 300;
  text-align: center;
  flex: 1;
  display: flex;
  align-items: top;
  justify-content: center;
`;

const NavigationItem = styled(Link)`
  width: calc(100% / 4);
  display:flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  margin-top: 10px;
  margin-bottom: 10px;

  &.active {
    ${NavigationIcon} {
      fill: #000;
    }

    ${NavigationLabel} {
      color: #000;
      font-weight: 500;
    }
  }
`;

export default class MobileNavigation extends React.PureComponent<{}, {}> {
  render() {
    return (
      <Container>

        <NavigationItem to="/" activeClassName="active">
          <NavigationIconWrapper>
            <NavigationIcon name="home" />
          </NavigationIconWrapper>
          <NavigationLabel>
            <FormattedMessage {...messages.mobilePageHome} />
          </NavigationLabel>
        </NavigationItem>

        <NavigationItem to="/ideas" activeClassName="active">
          <NavigationIconWrapper>
            <NavigationIcon name="idea" />
          </NavigationIconWrapper>
          <NavigationLabel>
            <FormattedMessage {...messages.mobilePageIdeas} />
          </NavigationLabel>
        </NavigationItem>

        <NavigationItem to="/projects" activeClassName="active">
          <NavigationIconWrapper>
            <NavigationIcon name="project2" />
          </NavigationIconWrapper>
          <NavigationLabel>
            <FormattedMessage {...messages.mobilePageProjects} />
          </NavigationLabel>
        </NavigationItem>

        <NavigationItem to="/profile/edit" activeClassName="active">
          <NavigationIconWrapper>
            <NavigationIcon name="profile" />
          </NavigationIconWrapper>
          <NavigationLabel>
            <FormattedMessage {...messages.mobilePageProfile} />
          </NavigationLabel>
        </NavigationItem>

      </Container>
    );
  }
}
