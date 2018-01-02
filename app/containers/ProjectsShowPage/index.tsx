import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link, browserHistory } from 'react-router';

// components
import Meta from './Meta';
import EventsPreview from './EventsPreview';
import ContentContainer from 'components/ContentContainer';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { projectBySlugStream, IProject } from 'services/projects';
import { projectImagesStream, IProjectImages } from 'services/projectImages';
import { phasesStream } from 'services/phases';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';


const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  width: 100%;
  height: 350px;
  display: flex;
  padding-left: 30px;
  padding-right: 30px;
  position: relative;
`;

const HeaderLabel = styled.div`
  color: #fff;
  font-size: 18px;
  font-weight: 300;
  text-align: left;
  margin: 0;
  margin-top: 100px;
  padding: 0;
  z-index: 2;
`;

const HeaderTitle = styled.div`
  color: #fff;
  font-size: 42px;
  line-height: 48px;
  font-weight: 500;
  text-align: left;
  margin: 0;
  margin-top: 10px;
  padding: 0;
  z-index: 2;

  /*
  ${media.tablet`
    font-size: 40px;
    line-height: 48px;
  `}

  ${media.phone`
    font-weight: 600;
    font-size: 34px;
    line-height: 38px;
  `}

  ${media.smallPhone`
    font-weight: 600;
    font-size: 30px;
    line-height: 34px;
  `}
  */
`;

const HeaderOverlay = styled.div`
  background: #000;
  opacity: 0.55;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
`;

const HeaderImage: any = styled.div`
  background-image: url(${(props: any) => props.src});
  background-repeat: no-repeat;
  background-size: cover;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const ProjectMenu = styled.div`
  background-color: #FFFFFF;
  border-bottom: 1px solid #EAEAEA;
  width: 100%;
`;

const ProjectMenuItems = styled.div`
  width: 100%;
  height: 55px;
  display: flex;
  overflow-x: auto;
  margin: 0 auto;
`;

const ProjectMenuItem = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #232F45;
  opacity: 0.5;
  font-size: 17px;
  font-weight: 500;
  border-bottom: 3px solid rgba(0,0,0,0); //Takes the space so the hover doesn't make the text "jump"
  margin: 0 1rem;
  padding: 0 1rem;

  &:first-child {
    margin-left: 0;
  }

  &.active,
  &:hover {
    color: #232F45;
    opacity: 1;
    /* border-bottom: 3px solid ${(props) => props.theme.colorMain}; */
  }
`;


type Props = {
  params: {
    slug: string;
  };
};

type State = {
  locale: string | null;
  currentTenantLocales: string[] | null;
  project: IProject | null;
  loaded: boolean;
};

export default class ProjectsShowPage extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenantLocales: null,
      project: null,
      loaded: false
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenantLocales$ = currentTenantStream().observable.map(currentTenant => currentTenant.data.attributes.settings.core.locales);
    const project$ = projectBySlugStream(this.props.params.slug).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenantLocales$,
        project$
      ).switchMap(([locale, currentTenantLocales, project]) => {
        const projectImages$ = projectImagesStream(project.data.id).observable;
        const phases$ = phasesStream(project.data.id).observable;

        return Rx.Observable.combineLatest(
          projectImages$,
          phases$
        ).map(([projectImages, phases]) => {
          return {
            locale,
            currentTenantLocales,
            project
          };
        });
      }).subscribe(({ locale, currentTenantLocales, project }) => {
        this.setState({
          locale,
          currentTenantLocales,
          project,
          loaded: true
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { params } = this.props;
    const { locale, currentTenantLocales, project, loaded } = this.state;
    const basePath = `/projects/${params.slug}`;

    if (loaded && locale && currentTenantLocales && project) {
      const { children } = this.props;
      const projectTitle = getLocalized(project.data.attributes.title_multiloc, locale, currentTenantLocales);
      const projectHeaderImageLarge = (project.data.attributes.header_bg.large || null);

      return (
        <div>
          <Meta projectSlug={params.slug} />

          <Container>
            <Header>
              <HeaderImage src={projectHeaderImageLarge} />
              <HeaderOverlay />
              <ContentContainer>
                <HeaderLabel>
                  <FormattedMessage {...messages.project} />
                </HeaderLabel>
                <HeaderTitle>
                  {projectTitle}
                </HeaderTitle>
              </ContentContainer>
            </Header>

            <ProjectMenu>
              <ContentContainer>
                <ProjectMenuItems>
                  <ProjectMenuItem to={`${basePath}`}>
                    <FormattedMessage {...messages.navTimeline} />
                  </ProjectMenuItem>

                  <ProjectMenuItem to={`${basePath}/info`}>
                    <FormattedMessage {...messages.navInfo} />
                  </ProjectMenuItem>

                  <ProjectMenuItem to={`${basePath}/events`}>
                    <FormattedMessage {...messages.navEvents} />
                  </ProjectMenuItem>
                </ProjectMenuItems>
              </ContentContainer>
            </ProjectMenu>

            {children}

            {/*
            {(this.props.location.pathname !== `${basePath}/events`) &&
              <EventsPreview eventsPageUrl={`${basePath}/events`} projectId={project && project.get('id')} />
            }
            */}
          </Container>

        </div>
      );
    }

    return null;
  }
}
