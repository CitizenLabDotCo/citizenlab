import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import Meta from './Meta';
import Footer from 'components/Footer';
import Spinner from 'components/UI/Spinner';
import Button from 'components/UI/Button';

// Data loading
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';

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

const ProjectNotFoundWrapper = styled.div`
  height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  font-size: ${fontSizes.large}px;
  color: ${colors.label};
`;

interface Props {}

interface State {
  hasEvents: boolean;
  loaded: boolean;
}

class ProjectsShowPage extends React.PureComponent<Props & WithRouterProps & GetProjectChildProps, State> {
  render() {
    const { children, project, projectLoadingError } = this.props;
    const { slug } = this.props.params;

    return (
      <>
        <Meta projectSlug={slug} />
        <Container>
          {projectLoadingError &&
            <ProjectNotFoundWrapper>
              <p><FormattedMessage {...messages.noProjectFoundHere} /></p>
              <Button
                linkTo="/projects"
                text={<FormattedMessage {...messages.goBackToList} />}
                icon="arrow-back"
                circularCorners={false}
              />
            </ProjectNotFoundWrapper>
          }
          {project &&
            <>
              <Content>
                {children}
              </Content>
              <Footer showCityLogoSection={false} />
            </>
          }
          {!projectLoadingError && !project &&
            <Spinner />
          }
        </Container>
      </>
    );
  }
}

export default withRouter((props: WithRouterProps) => (
  <GetProject slug={props.params.slug}>
    {({ project, projectLoadingError }) => (
      <ProjectsShowPage {...props} {...{ project, projectLoadingError }} />
    )}
  </GetProject>
));
