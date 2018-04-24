import React from 'react';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { projectByIdStream, projectBySlugStream, IProjectData, IProject } from 'services/projects';

interface InputProps {
  id?: string | null;
  slug?: string | null;
}

type children = (renderProps: State) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  project: IProjectData | null;
  projectLoadingError: string | null;
}

export type GetProjectChildProps = State;

export default class GetProject extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      project: null,
      projectLoadingError: null,
    };
  }

  componentDidMount() {
    const { id, slug } = this.props;

    this.inputProps$ = new BehaviorSubject({ id, slug });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .switchMap(({ id, slug }) => {
          let project$: Observable<IProject | null> = Observable.of(null);

          if (id) {
            project$ = projectByIdStream(id).observable;
          } else if (slug) {
            project$ = projectBySlugStream(slug).observable;
          }

          return project$;
        })
        .subscribe((project) => {
          if (project) {
            this.setState({ project: project.data });
          } else {
            this.setState({ projectLoadingError: 'Could not find a project' });
          }
        })
    ];
  }

  componentDidUpdate() {
    const { id, slug } = this.props;
    this.inputProps$.next({ id, slug });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    return (children as children)(this.state);
  }
}
