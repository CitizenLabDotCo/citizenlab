import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';

// router
import { browserHistory } from 'react-router';

// components
import Timeline from './Timeline';
import Phase from './Phase';
import EventsPreview from '../EventsPreview';

// services
import { projectBySlugStream } from 'services/projects';

// style
import styled from 'styled-components';

const Container = styled.div``;

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

    this.subscriptions = [
      this.slug$.distinctUntilChanged().filter(slug => isString(slug)).switchMap((slug) => {
        const project$ = projectBySlugStream(slug).observable;
        return project$.map((project) => ({ slug, project }));
      }).delay(3000).subscribe(({ slug, project }) => {
        if (project.data.attributes.process_type !== 'timeline') {
          browserHistory.push(`/projects/${slug}/info`);
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
    const { projectId, phaseId } = this.state;

    if (projectId) {
      return (
        <Container className={className}>
          <Timeline projectId={projectId} onPhaseSelected={this.handleOnPhaseSelected} />
          {phaseId && <Phase phaseId={phaseId} />}
          <EventsPreview projectId={projectId} />
        </Container>
      );
    }

    return null;
  }
}
