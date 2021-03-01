import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { media, fontSizes, colors, isRtl } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { Icon } from 'cl2-component-library';
import messages from '../../messages';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import FeatureFlag from 'components/FeatureFlag';
import { lighten } from 'polished';

const Container = styled.nav`
  height: ${(props) => props.theme.mobileMenuHeight}px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 3px;
  background: #fff;
  border-top: solid 1px ${lighten(0.4, colors.label)};
  display: flex;
  align-items: stretch;
  justify-content: space-evenly;
  z-index: 1004;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.biggerThanMaxTablet`
    display: none;
  `}

  @media print {
    display: none;
  }
`;

const NavigationIcon = styled(Icon)`
  fill: ${colors.label};
  height: 24px;
  width: 24px;

  .cl-icon-primary,
  .cl-icon-accent,
  .cl-icon-secondary {
    fill: ${colors.label};
  }
`;

const NavigationIconWrapper = styled.div`
  display: flex;
  height: 24px;
  width: 24px;
  align-items: center;
  justify-content: center;

  ${media.smallPhone`
    height: 20px;
    width: 20px;
  `}
`;

const NavigationLabel = styled.div`
  width: 100%;
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin-left: 6px;

  ${isRtl`
  margin-left: 0;
  margin-right: 6px;
`}

  ${media.smallPhone`
    font-size: ${fontSizes.base - 1}px;
  `}
`;

const NavigationItem = styled(Link)`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0 auto;

  ${isRtl`
    flex-direction: row-reverse;
`}

  &.active {
    ${NavigationIcon} {
      fill: ${(props) => props.theme.colorMain};

      .cl-icon-primary,
      .cl-icon-accent,
      .cl-icon-secondary {
        fill: ${(props) => props.theme.colorMain};
      }
    }

    ${NavigationLabel} {
      color: ${(props) => props.theme.colorMain};
      font-weight: 400;
    }
  }
`;

interface InputProps {
  setRef?: (arg: HTMLElement) => void | undefined;
  className?: string;
}

interface DataProps {}

interface Props extends InputProps, DataProps {}

interface State {}

class MobileNavigation extends PureComponent<Props & WithRouterProps, State> {
  handleRef = (element: HTMLElement) => {
    this.props.setRef && this.props.setRef(element);
  };

  render() {
    const { location, className } = this.props;
    const urlSegments = !isNilOrError(location)
      ? location.pathname.replace(/^\/|\/$/g, '').split('/')
      : [''];
    const secondUrlSegment =
      urlSegments && urlSegments.length >= 1 ? urlSegments[1] : null;

    return (
      <Container className={className} ref={this.handleRef}>
        <NavigationItem to="/" activeClassName="active" onlyActiveOnIndex>
          <NavigationIconWrapper>
            <NavigationIcon ariaHidden name="homeFilled" />
          </NavigationIconWrapper>
          <NavigationLabel>
            <FormattedMessage {...messages.mobilePageHome} />
          </NavigationLabel>
        </NavigationItem>

        <NavigationItem
          to="/projects"
          className={secondUrlSegment === 'projects' ? 'active' : ''}
        >
          <NavigationIconWrapper>
            <NavigationIcon ariaHidden name="folder" />
          </NavigationIconWrapper>
          <NavigationLabel>
            <FormattedMessage {...messages.mobilePageProjects} />
          </NavigationLabel>
        </NavigationItem>

        <FeatureFlag name="ideas_overview">
          <NavigationItem
            to="/ideas"
            className={secondUrlSegment === 'ideas' ? 'active' : ''}
          >
            <NavigationIconWrapper>
              <NavigationIcon ariaHidden name="idea2" />
            </NavigationIconWrapper>
            <NavigationLabel>
              <FormattedMessage {...messages.mobilePageInputs} />
            </NavigationLabel>
          </NavigationItem>
        </FeatureFlag>

        <FeatureFlag name="initiatives">
          <NavigationItem
            to="/initiatives"
            className={secondUrlSegment === 'initiatives' ? 'active' : ''}
          >
            <NavigationIconWrapper>
              <NavigationIcon ariaHidden name="initiatives" />
            </NavigationIconWrapper>
            <NavigationLabel>
              <FormattedMessage {...messages.mobilePageInitiatives} />
            </NavigationLabel>
          </NavigationItem>
        </FeatureFlag>
      </Container>
    );
  }
}

export default withRouter<Props>(MobileNavigation);
