import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap, tap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import {
  IGroupsProjectsData,
  groupsProjectsByProjectIdStream,
} from 'services/groupsProjects';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  projectId: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetProjectGroupsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  projectGroups: IGroupsProjectsData[] | undefined | null | Error;
}

export type GetProjectGroupsChildProps =
  | IGroupsProjectsData[]
  | undefined
  | null
  | Error;

export default class GetProjectGroups extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      projectGroups: undefined,
    };
  }

  componentDidMount() {
    const { projectId, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ projectId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(
            () => resetOnChange && this.setState({ projectGroups: undefined })
          ),
          filter(({ projectId }) => isString(projectId)),
          switchMap(
            ({ projectId }: { projectId: string }) =>
              groupsProjectsByProjectIdStream(projectId).observable
          )
        )
        .subscribe((projectGroups) => {
          this.setState({
            projectGroups: !isNilOrError(projectGroups)
              ? projectGroups.data
              : projectGroups,
          });
        }),
    ];
  }

  componentDidUpdate() {
    const { projectId, resetOnChange } = this.props;
    this.inputProps$.next({ projectId, resetOnChange });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { projectGroups } = this.state;
    return (children as children)(projectGroups);
  }
}
