import React from 'react';
import isString from 'lodash/isString';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap, tap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IProjectFileData, projectFilesStream } from 'services/projectFiles';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  projectId: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetProjectFilesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  projectFiles: IProjectFileData[] | undefined | null | Error;
}

export type GetProjectFilesChildProps = IProjectFileData[] | undefined | null | Error;

export default class GetProjectFiles extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  public static defaultProps: Partial<Props> = {
    resetOnChange: true
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      projectFiles: undefined
    };
  }

  componentDidMount() {
    const { projectId, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ projectId });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        tap(() => resetOnChange && this.setState({ projectFiles: undefined })),
        filter(({ projectId }) => isString(projectId)),
        switchMap(({ projectId }: { projectId: string }) => projectFilesStream(projectId).observable)
      )
      .subscribe((projectFiles) => {
        this.setState({ projectFiles: (!isNilOrError(projectFiles) ? projectFiles.data : projectFiles) });
      })
    ];
  }

  componentDidUpdate() {
    const { projectId, resetOnChange } = this.props;
    this.inputProps$.next({ projectId, resetOnChange });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { projectFiles } = this.state;
    return (children as children)(projectFiles);
  }
}
