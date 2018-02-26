import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';

// router
import { browserHistory } from 'react-router';

// components
import Header from '../Header';
import Timeline from './Timeline';
import Phase from './Phase';
import EventsPreview from '../EventsPreview';

// services
import { projectBySlugStream } from 'services/projects';
import { phasesStream } from 'services/phases';

// style
import styled from 'styled-components';

const Container = styled.div``;

const StyledHeader = styled(Header)``;

const StyledTimeline = styled(Timeline)`
  margin-top: -40px;
  position: relative;
`;

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  projectId: string | null;
  phaseId: string | null;
};

export default class ProjectTimelinePage extends React.PureComponent<Props, State> {
  slug$: Rx.BehaviorSubject<string>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      projectId: null,
      phaseId: null
    };
    this.slug$ = new Rx.BehaviorSubject(null as any);
    this.subscriptions = [];
  }

  componentDidMount() {
    this.slug$.next(this.props.params.slug);

    const currentLocation = browserHistory.getCurrentLocation();
    const currentPath = currentLocation.pathname;
    const lastUrlSegment = currentPath.substr(currentPath.lastIndexOf('/') + 1);

    if (lastUrlSegment === 'timeline') {
      browserHistory.push(`/projects/${this.props.params.slug}/process`);
    }

    this.subscriptions = [
      this.slug$
        .distinctUntilChanged()
        .filter(slug => isString(slug))
        .switchMap((slug: string) => {
          return projectBySlugStream(slug).observable.map(project => ({ slug, project }));
        })
        .switchMap(({ slug, project }) => {
          return phasesStream(project.data.id).observable.map(() => ({ slug, project }));
        })
        .subscribe(({ slug, project }) => {
          if (project.data.attributes.process_type !== 'timeline') {
            browserHistory.push(`/projects/${slug}/ideas`);
          }

          this.setState({ projectId: project.data.id });
        })
    ];
  }

  componentDidUpdate(_prevProps: Props) {
    this.slug$.next(this.props.params.slug);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnPhaseSelected = (phaseId: string | null) => {
    this.setState({ phaseId });
  }

  render() {
    const className = this.props['className'];
    const { slug } = this.props.params;
    const { projectId, phaseId } = this.state;

    if (projectId) {
      return (
        <Container className={className}>
          <StyledHeader slug={slug} />

          <StyledTimeline projectId={projectId} onPhaseSelected={this.handleOnPhaseSelected} />

          {phaseId && 
            <Phase phaseId={phaseId} />
          }

          <EventsPreview projectId={projectId} />
        </Container>
      );
    }

    return null;
  }
}
