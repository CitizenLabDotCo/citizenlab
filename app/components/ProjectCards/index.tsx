import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import ProjectCard from 'components/ProjectCard';
import ContentContainer from 'components/ContentContainer';

// services
import { state, IStateStream } from 'services/state';
import { projectsStream, IProjects, IProject } from 'services/projects';

// style
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
`;

type Props = {};

type State = {
  loading: boolean;
  projects: IProjects | null;
};

const namespace = 'ProjectCards/index';

export default class ProjectCards extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  componentWillMount() {
    const initialState: State = { loading: true, projects: null };
    this.state$ = state.createStream<State>(namespace, namespace, initialState);

    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),
      projectsStream().observable.subscribe((projects) => this.state$.next({ projects, loading: false }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { loading, projects } = this.state;

    return (
      <Container>
        {loading && <h1>Loading...</h1>}
        {!loading && projects && projects.data.map((project) => (
          <ProjectCard key={project.id} id={project.id} />
        ))}
      </Container>
    );
  }
}
