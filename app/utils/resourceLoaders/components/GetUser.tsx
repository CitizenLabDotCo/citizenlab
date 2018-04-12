import React from 'react';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IUser, IUserData, userBySlugStream, userByIdStream } from 'services/users';

interface InputProps {
  id?: string;
  slug?: string;
}

type children = (renderProps: GetUserChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  user: IUserData | null;
}

export type GetUserChildProps = IUserData | null;

export default class GetUser extends React.PureComponent<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      user: null
    };
  }

  componentDidMount() {
    const { id, slug } = this.props;

    this.inputProps$ = new BehaviorSubject({ id, slug });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .switchMap(({ id, slug }) => {
          let user$: Observable<IUser | null> = Observable.of(null);

          if (id) {
            user$ = userByIdStream(id).observable;
          } else if (slug) {
            user$ = userBySlugStream(slug).observable;
          }

          return user$;
        }).subscribe((user) => {
          this.setState({ user: (user ? user.data : null) });
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
    const { user } = this.state;
    return (children as children)(user);
  }
}
