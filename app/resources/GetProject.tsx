import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { projectByIdStream, projectBySlugStream, IProjectData, IProject } from 'services/projects';

interface InputProps {
  id?: string | null;
  slug?: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetProjectChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  project: IProjectData | undefined | null | Error;
}

export type GetProjectChildProps = IProjectData | undefined | null | Error;

export default class GetProject extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  public static defaultProps: Partial<Props> = {
    resetOnChange: true
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      project: undefined
    };
  }

  componentDidMount() {
    const { id, slug, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ id, slug });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .do(() => resetOnChange && this.setState({ project: undefined }))
        .switchMap(({ id, slug }) => {
          let project$: Observable<IProject | null | Error> = Observable.of(null);

          if (id) {
            project$ = projectByIdStream(id).observable;
          } else if (slug) {
            project$ = projectBySlugStream(slug).observable;
          }

          return project$;
        })
        .subscribe((project) => {
          this.setState({ project: !isNilOrError(project) ? project.data : project });
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
    const { project } = this.state;
    return (children as children)(project);
  }
}
