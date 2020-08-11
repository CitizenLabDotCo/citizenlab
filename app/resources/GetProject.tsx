import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { isNilOrError } from 'utils/helperUtils';
import shallowCompare from 'utils/shallowCompare';
import {
  projectByIdStream,
  projectBySlugStream,
  IProjectData,
} from 'services/projects';

interface InputProps {
  projectId?: string | null;
  projectSlug?: string | null;
  resetOnChange?: boolean;
}

export type GetProjectChildProps = IProjectData | undefined | null | Error;

type children = (renderProps: GetProjectChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  project: GetProjectChildProps;
}

export default class GetProject extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      project: undefined,
    };
  }

  componentDidMount() {
    const { projectId, projectSlug, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ projectId, projectSlug });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ project: undefined })),
          switchMap(({ projectId, projectSlug }) => {
            if (isString(projectId)) {
              return projectByIdStream(projectId).observable;
            } else if (isString(projectSlug)) {
              return projectBySlugStream(projectSlug).observable;
            }

            return of(null);
          })
        )
        .subscribe((project) => {
          this.setState({
            project: !isNilOrError(project) ? project.data : project,
          });
        }),
    ];
  }

  componentDidUpdate() {
    const { projectId, projectSlug } = this.props;
    this.inputProps$.next({ projectId, projectSlug });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { project } = this.state;
    return (children as children)(project);
  }
}
