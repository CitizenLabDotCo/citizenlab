import React from 'react';
import { BehaviorSubject, Subscription, Observable, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap, map } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IProject, IProjectData, projectByIdStream } from 'services/projects';
import { IPhaseData, phasesStream } from 'services/phases';

interface InputProps {
  projectId?: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetPBContextChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  pbContext: IProjectData | IPhaseData | undefined | null;
}

export type GetPBContextChildProps =
  | IProjectData
  | IPhaseData
  | undefined
  | null;

export default class GetPBContext extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      pbContext: undefined,
    };
  }

  componentDidMount() {
    const { projectId, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ projectId });

    const fn: (
      project: IProject | null
    ) => Observable<IProjectData | IPhaseData | null> = (project) => {
      if (project) {
        if (project.data.attributes.participation_method === 'budgeting') {
          return of(project.data);
        } else if (project.data.attributes.process_type === 'timeline') {
          return phasesStream(project.data.id).observable.pipe(
            map((phases) => {
              const pbPhase = phases.data.find(
                (phase) => phase.attributes.participation_method === 'budgeting'
              );
              return pbPhase || null;
            })
          );
        }
      }

      return of(null);
    };

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ pbContext: undefined })),
          switchMap(({ projectId }) =>
            projectId ? projectByIdStream(projectId).observable : of(null)
          ),
          switchMap(fn)
        )
        .subscribe((pbContext) => {
          this.setState({ pbContext });
        }),
    ];
  }

  componentDidUpdate() {
    const { projectId } = this.props;
    this.inputProps$.next({ projectId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { pbContext } = this.state;
    return (children as children)(pbContext);
  }
}
