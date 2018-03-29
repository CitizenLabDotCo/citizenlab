import React from 'react';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IUserData, userBySlugStream, userByIdStream } from 'services/users';

interface InputProps {
  id?: string;
  slug?: string;
}

interface Props extends InputProps {
  children: (renderProps: GetUserChildProps) => JSX.Element | null ;
}

interface State {
  user: IUserData | null;
}

export type GetUserChildProps = State;

export default class GetIdea extends React.PureComponent<Props, State> {
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
      this.inputProps$.distinctUntilChanged((prev, next) => {
        return shallowCompare(prev, next);
      }).switchMap(({ id, slug }) => {
        if (id) {
          return userByIdStream(id).observable;
        } else if (slug) {
          return userBySlugStream(slug).observable;
        } else {
          return Observable.of(null);
        }
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
    return children({ user });
  }
}
