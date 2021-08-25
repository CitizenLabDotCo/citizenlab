import React, { useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { media, fontSizes, colors, isRtl } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { Icon } from 'cl2-component-library';
import messages from './messages';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import Button from 'components/UI/Button';
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
  border-top: solid 1px ${lighten(0.3, colors.label)};
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
  height: 22px;
  width: 22px;

  .cl-icon-primary,
  .cl-icon-accent,
  .cl-icon-secondary {
    fill: ${colors.label};
  }
`;

const NavigationIconWrapper = styled.div`
  display: flex;
  height: 22px;
  width: 22px;
  align-items: center;
  justify-content: center;
  margin-right: 5px;

  ${media.smallPhone`
    height: 20px;
    width: 20px;
  `}
`;

const NavigationLabel = styled.div`
  width: 100%;
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 500;

  ${isRtl`
    margin-left: 0;
    margin-right: 6px;
  `}
`;

const NavigationItems = styled.ul`
  display: flex;
  width: 100%;
  margin: 0;
`;

const NavigationItem = styled.li`
  display: flex;
  align-items: stretch;
  cursor: pointer;
  margin: 0 auto;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const NavigationItemContentStyles = css`
  display: flex;
  align-items: center;
`;

const StyledLink = styled(Link)`
  ${NavigationItemContentStyles}

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
    }
  }
`;

const ShowFullNavigationButton = styled(Button)`
  ${NavigationItemContentStyles}
`;

interface Props {
  setRef?: (arg: HTMLElement) => void | undefined;
  className?: string;
}

const MobileNavigation = ({
  location,
  className,
  setRef,
}: Props & WithRouterProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const urlSegments = !isNilOrError(location)
    ? location.pathname.replace(/^\/|\/$/g, '').split('/')
    : [''];
  const secondUrlSegment =
    urlSegments && urlSegments.length >= 1 ? urlSegments[1] : null;

  useEffect(() => {
    if (setRef && containerRef.current) {
      setRef(containerRef.current);
    }
  }, []);

  return (
    <Container className={className} ref={containerRef}>
      <NavigationItems>
        <NavigationItem>
          <StyledLink to="/" activeClassName="active" onlyActiveOnIndex>
            <NavigationIconWrapper>
              <NavigationIcon ariaHidden name="homeFilled" />
            </NavigationIconWrapper>
            <NavigationLabel>
              <FormattedMessage {...messages.mobilePageHome} />
            </NavigationLabel>
          </StyledLink>
        </NavigationItem>

        <NavigationItem>
          <StyledLink
            to="/projects"
            className={secondUrlSegment === 'projects' ? 'active' : ''}
          >
            <NavigationIconWrapper>
              <NavigationIcon ariaHidden name="folder" />
            </NavigationIconWrapper>
            <NavigationLabel>
              <FormattedMessage {...messages.mobilePageProjects} />
            </NavigationLabel>
          </StyledLink>
        </NavigationItem>

        <NavigationItem>
          <ShowFullNavigationButton icon="more-options" buttonStyle="text">
            {/* <NavigationIconWrapper>
              <NavigationIcon ariaHidden name="idea2" />
            </NavigationIconWrapper> */}
            <NavigationLabel>
              <FormattedMessage {...messages.showMore} />
            </NavigationLabel>
          </ShowFullNavigationButton>
        </NavigationItem>
      </NavigationItems>
    </Container>
  );
};

export default withRouter(MobileNavigation);
