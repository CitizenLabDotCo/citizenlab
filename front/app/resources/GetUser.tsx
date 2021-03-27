import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IUserData, userBySlugStream, userByIdStream } from 'services/users';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  id?: string | null;
  slug?: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetUserChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  user: IUserData | undefined | null | Error;
}

export type GetUserChildProps = IUserData | undefined | null | Error;

export default class GetUser extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

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
    const { id, slug, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ id, slug });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ user: undefined })),
          switchMap(({ id, slug }) => {
            if (isString(id)) {
              return userByIdStream(id).observable;
            } else if (isString(slug)) {
              return userBySlugStream(slug).observable;
            }

            return of(null);
          })
        )
        .subscribe((user) => {
          this.setState({ user: !isNilOrError(user) ? user.data : user });
        }),
    ];
  }

  componentDidUpdate() {
    const { id, slug } = this.props;
    this.inputProps$.next({ id, slug });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { user } = this.state;
    return (children as children)(user);
  }
}
