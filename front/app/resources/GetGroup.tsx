import React from 'react';
import { isString } from 'lodash-es';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { getGroup, IGroupData } from 'services/groups';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  id: string;
}

type children = (renderProps: GetGroupChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  group: IGroupData | undefined | null | Error;
}

export type GetGroupChildProps = IGroupData | undefined | null | Error;

export default class GetGroup extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      group: undefined,
    };
  }

  componentDidMount() {
    const { id } = this.props;

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          filter(({ id }) => isString(id)),
          switchMap(({ id }) => getGroup(id).observable)
        )
        .subscribe((group) =>
          this.setState({ group: !isNilOrError(group) ? group.data : group })
        ),
    ];
  }

  componentDidUpdate() {
    const { id } = this.props;
    this.inputProps$.next({ id });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { group } = this.state;
    return (children as children)(group);
  }
}
