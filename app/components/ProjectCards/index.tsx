import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import ProjectCard from 'components/ProjectCard';
import ContentContainer from 'components/ContentContainer';
import Spinner from 'components/UI/Spinner';

// services
import { projectsStream, IProjects, IProject } from 'services/projects';
import { projectImagesStream, IProjectImages } from 'services/projectImages';

// style
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
`;

const Loading = styled.div`
  width: 100%;
  height: 200px;
  background: #fff;
  border-radius: 6px;
  border: solid 1px #eee;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledSpinner = styled(Spinner) ``;

type Props = {
  filter?: { [key: string]: any };
};

type State = {
  loading: boolean;
  projects: IProjects | null;
};

export default class ProjectCards extends React.PureComponent<Props, State> {
  state: State;
  filterChange$: Rx.BehaviorSubject<object | null>;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      loading: true,
      projects: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const filter = (!_.isUndefined(this.props.filter) && _.isObject(this.props.filter) && !_.isEmpty(this.props.filter) ? this.props.filter : null);

    this.filterChange$ = new Rx.BehaviorSubject(filter);

    this.subscriptions = [
      this.filterChange$.switchMap((filter) => {
        const queryParameters = (filter !== null ? filter : {});
        return projectsStream({ queryParameters }).observable;
      }).switchMap((projects) => {
        if (projects && projects.data && projects.data.length > 0) {
          const observables = projects.data.map(project => projectImagesStream(project.id).observable);
          return Rx.Observable.combineLatest(observables).map(() => projects);
        }

        return Rx.Observable.of(projects);
      }).subscribe((projects) => {
        this.setState({ projects, loading: false });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  componentWillReceiveProps(newProps) {
    const oldFilter = this.props.filter;
    const newFilter = (!_.isUndefined(newProps.filter) && _.isObject(newProps.filter) && !_.isEmpty(newProps.filter) ? newProps.filter : null);

    if (!_.isEqual(oldFilter, newFilter)) {
      this.filterChange$.next({ filter: newFilter });
    }
  }

  render() {
    const { loading, projects } = this.state;

    const loadingIndicator = (loading ? (
      <Loading>
        <StyledSpinner />
      </Loading>
    ) : null);

    const projectCards = ((!loading && projects) ? projects.data.map((project) => (
      <ProjectCard key={project.id} id={project.id} />
    )) : null);

    return (
      <Container>
        {loadingIndicator}
        {projectCards}
      </Container>
    );
  }
}
