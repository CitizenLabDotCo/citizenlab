import React from 'react';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';

// components
import Meta from './Meta';
import Footer from 'components/Footer';
import Spinner from 'components/UI/Spinner';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetEvents, { GetEventsChildProps } from 'resources/GetEvents';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Loading = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

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

interface InputProps {}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
  events: GetEventsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class ProjectsShowPage extends React.PureComponent<Props & WithRouterProps, State> {
  render() {
    const { children, locale, tenant, project, phases, events } = this.props;
    const { slug } = this.props.params;

    return (
      <>
        <Meta projectSlug={slug} />
        <Container>
          {(locale && tenant && project !== null && phases !== null && events !== null) ? (
            <>
              <Content>
                {children}
              </Content>
              <Footer showCityLogoSection={false} />
            </>
          ) : (
            <Loading>
              <Spinner size="32px" color="#666" />
            </Loading>
          )}
        </Container>
      </>
    );
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  locale: <GetLocale/>,
  tenant: <GetTenant/>,
  project: ({ params, render }) => <GetProject slug={params.slug} resetOnChange>{render}</GetProject>,
  phases: ({ project, render }) => <GetPhases projectId={(project ? project.id : null)}>{render}</GetPhases>,
  events: ({ project, render }) => <GetEvents projectId={(project ? project.id : null)}>{render}</GetEvents>
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectsShowPage {...inputProps} {...dataProps} />}
  </Data>
));
