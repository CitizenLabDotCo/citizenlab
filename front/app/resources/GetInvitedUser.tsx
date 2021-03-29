import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { IUserData, userByInviteStream } from 'services/users';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  token: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetInvitedUserChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  user: IUserData | undefined | null;
}

export type GetInvitedUserChildProps = IUserData | undefined | null;

export default class GetInvitedUser extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<string | null>;
  private subscription: Subscription;

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      user: undefined,
    };
  }

  componentDidMount() {
    const { resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject(this.props.token);

    this.subscription = this.inputProps$
      .pipe(
        distinctUntilChanged(),
        tap(() => resetOnChange && this.setState({ user: undefined })),
        switchMap((token) =>
          isString(token) ? userByInviteStream(token).observable : of(null)
        )
      )
      .subscribe((user) => {
        this.setState({ user: !isNilOrError(user) ? user.data : null });
      });
  }

  componentDidUpdate() {
    this.inputProps$.next(this.props.token);
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const { children } = this.props;
    const { user } = this.state;
    return (children as children)(user);
  }
}
