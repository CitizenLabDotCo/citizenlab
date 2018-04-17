import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';

// components
import Meta from './Meta';
import Footer from 'components/Footer';
import Spinner from 'components/UI/Spinner';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';
import { projectBySlugStream, IProject } from 'services/projects';
import { phasesStream } from 'services/phases';
import { eventsStream } from 'services/events';

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

const Loading = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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


type Props = {
  params: {
    slug: string;
  };
};

type State = {
  project: IProject | null,
  hasEvents: boolean,
  loaded: boolean
};

export default class ProjectsShowPage extends React.PureComponent<Props, State> {
  slug$: Rx.BehaviorSubject<string>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      project: null,
      hasEvents: false,
      loaded: false
    };
    this.slug$ = new Rx.BehaviorSubject(null as any);
    this.subscriptions = [];
  }

  componentDidMount() {
    this.slug$.next(this.props.params.slug);

    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const slug$ = this.slug$
                    .distinctUntilChanged()
                    .do(() => this.setState({ loaded: false }))
                    .filter(slug => isString(slug));

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        slug$
      ).switchMap(([_locale, _currentTenant, slug]) => {
        return projectBySlugStream(slug).observable;
      }).switchMap((project) => {
        const phases$ = project && project.data ? phasesStream(project.data.id).observable : Rx.Observable.of(null);
        const events$ = project && project.data ? eventsStream(project.data.id).observable : Rx.Observable.of(null);

        return Rx.Observable.combineLatest(
          phases$,
          events$
        ).map(([_phases, events]) => ({ events, project }));
      }).subscribe(({ events, project }) => {
        const hasEvents = !!(events && events.data && events.data.length > 0);
        this.setState({ project, hasEvents, loaded: true });
      })
    ];
  }

  componentDidUpdate() {
    this.slug$.next(this.props.params.slug);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { slug } = this.props.params;
    const { loaded, project } = this.state;

    return (
      <>
        <Meta projectSlug={slug} />
        <Container>
          {!loaded &&
            <Loading>
              <Spinner size="32px" color="#666" />
            </Loading>
          }
          {loaded && !project &&
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
          {loaded && project &&
            <>
              <Content>
                {children}
              </Content>
              <Footer showCityLogoSection={false} />
            </>
          }
        </Container>
      </>
    );
  }
}
