import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import Icon from 'components/UI/Icon';
import messages from '../../messages';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

const Container = styled.div`
  height: ${(props) => props.theme.mobileMenuHeight}px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 3px;
  background: #fff;
  border-top: solid 1px ${colors.separation};
  display: flex;
  align-items: stretch;
  justify-content: space-evenly;
  z-index: 100000;

  ${media.biggerThanMaxTablet`
    display: none;
  `}

  @media print {
    display: none;
  }
`;

const NavigationIcon = styled(Icon)`
  fill: #999;
  height: 24px;
  width: 24px;

  .cl-icon-primary, .cl-icon-accent, .cl-icon-secondary {
    fill: #999;
  }
`;

const NavigationIconWrapper = styled.div`
  display: flex;
  height: 24px;
  width: 24px;
  align-items: center;
  justify-content: center;
`;

const NavigationLabel = styled.div`
  width: 100%;
  color: #999;
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  margin-left: 5px;
`;

const NavigationItem = styled(Link)`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0 auto;

  &.active {
    ${NavigationIcon} {
      fill: ${(props) => props.theme.colorMain};

      .cl-icon-primary, .cl-icon-accent, .cl-icon-secondary  {
        fill: ${(props) => props.theme.colorMain};
      }
    }

    ${NavigationLabel} {
      color: ${(props) => props.theme.colorMain};
      font-weight: 500;
    }
  }
`;

interface InputProps {
  className?: string;
}

interface DataProps {}

interface Props extends InputProps, DataProps {}

interface State {}

class MobileNavigation extends PureComponent<Props & WithRouterProps, State> {
  render() {
    const { location, className } = this.props;
    const urlSegments = (!isNilOrError(location) ? location.pathname.replace(/^\/|\/$/g, '').split('/') : ['']);
    const secondUrlSegment = (urlSegments && urlSegments.length >= 1 ? urlSegments[1] : null);

    return (
      <Container className={className}>

        <NavigationItem to="/" activeClassName="active" onlyActiveOnIndex>
          <NavigationIconWrapper>
            <NavigationIcon name="homeFilled" />
          </NavigationIconWrapper>
          <NavigationLabel>
            <FormattedMessage {...messages.mobilePageHome} />
          </NavigationLabel>
        </NavigationItem>

        <NavigationItem to="/projects" className={secondUrlSegment === 'projects' ? 'active' : ''}>
          <NavigationIconWrapper>
            <NavigationIcon name="folder" />
          </NavigationIconWrapper>
          <NavigationLabel>
            <FormattedMessage {...messages.mobilePageProjects} />
          </NavigationLabel>
        </NavigationItem>

        <NavigationItem to="/ideas" className={secondUrlSegment === 'ideas' ? 'active' : ''}>
          <NavigationIconWrapper>
            <NavigationIcon name="ideas" />
          </NavigationIconWrapper>
          <NavigationLabel>
            <FormattedMessage {...messages.mobilePageIdeas} />
          </NavigationLabel>
        </NavigationItem>

      </Container>
    );
  }
}

export default withRouter<Props>(MobileNavigation);
