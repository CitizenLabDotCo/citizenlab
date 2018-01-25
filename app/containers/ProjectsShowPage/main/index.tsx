import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';
import 'moment-timezone';

// components
import ProjectPhasesPage from '../phases';
import ProjectInfoPage from '../info';

// services
import { projectBySlugStream, IProject } from 'services/projects';

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  project: IProject | null;
};

export default class timeline extends React.PureComponent<Props, State> {
  slug$: Rx.BehaviorSubject<string>;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      project: null
    };
    this.slug$ = new Rx.BehaviorSubject(null as any);
    this.subscriptions = [];
  }

  componentWillMount() {
    this.slug$.next(this.props.params.slug);

    this.subscriptions = [
      this.slug$.distinctUntilChanged().filter(slug => isString(slug)).switchMap((slug) => {
        const project$ = projectBySlugStream(slug).observable;
        return project$;
      }).subscribe((project) => {
        this.setState({ project });
      })
    ];
  }

  componentWillReceiveProps(newProps: Props) {
    this.slug$.next(newProps.params.slug);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { project } = this.state;

    if (project) {
      return (
        <>
          {project.data.attributes.process_type === 'timeline' ? (
            <ProjectPhasesPage projectId={project.data.id} />
          ) : (
            <ProjectInfoPage projectId={project.data.id} />
          )}
        </>
      );
    }

    return null;
  }
}
