import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import Meta from './Meta';
import Footer from 'components/Footer';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f9f9fa;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const Content = styled.div`
  flex: 1;
  width: 100%;
`;

interface Props {}

interface State {}

class ProjectsShowPage extends React.PureComponent<Props & WithRouterProps, State> {
  render() {
    const { children } = this.props;
    const { slug } = this.props.params;

    return (
      <>
        <Meta projectSlug={slug} />
        <Container>
          <Content>
            {children}
          </Content>
          <Footer showCityLogoSection={false} />
        </Container>
      </>
    );
  }
}

export default withRouter(ProjectsShowPage);
