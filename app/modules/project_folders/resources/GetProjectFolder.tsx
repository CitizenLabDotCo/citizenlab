import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { isNilOrError } from 'utils/helperUtils';
import shallowCompare from 'utils/shallowCompare';
import {
  projectFolderByIdStream,
  projectFolderBySlugStream,
  IProjectFolderData,
} from 'modules/project_folders/services/projectFolders';

interface InputProps {
  projectFolderId?: string | null;
  projectFolderSlug?: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetProjectFolderChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  projectFolder: IProjectFolderData | undefined | null | Error;
}

export type GetProjectFolderChildProps =
  | IProjectFolderData
  | undefined
  | null
  | Error;

export default class GetProjectFolder extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      projectFolder: undefined,
    };
  }

  componentDidMount() {
    const { projectFolderId, projectFolderSlug, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({
      projectFolderId,
      projectFolderSlug,
    });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(
            () => resetOnChange && this.setState({ projectFolder: undefined })
          ),
          switchMap(({ projectFolderId, projectFolderSlug }) => {
            if (isString(projectFolderId)) {
              return projectFolderByIdStream(projectFolderId).observable;
            } else if (isString(projectFolderSlug)) {
              return projectFolderBySlugStream(projectFolderSlug).observable;
            }

            return of(null);
          })
        )
        .subscribe((projectFolder) => {
          this.setState({
            projectFolder: !isNilOrError(projectFolder)
              ? projectFolder.data
              : projectFolder,
          });
        }),
    ];
  }

  componentDidUpdate() {
    const { projectFolderId, projectFolderSlug } = this.props;
    this.inputProps$.next({ projectFolderId, projectFolderSlug });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { projectFolder } = this.state;
    return (children as children)(projectFolder);
  }
}
