// Libs
import React from 'react';
import { Subscription } from 'rxjs';

// Services & utils
import { IUserData, userBySlugStream, userByIdStream, IUser } from 'services/users';
// Typing
interface Props {
  id?: string;
  slug?: string;
  children: (renderProps: GetUserChildProps) => JSX.Element | null ;
}

interface State {
  user: IUserData | null;
}

export type GetUserChildProps = State;

export default class GetIdea extends React.PureComponent<Props, State> {
  private subscription: Subscription;

  constructor(props: Props) {
    super(props);

    this.state = {
      user: null
    };
  }

  componentDidMount() {
    this.updateSubscription();
  }

  componentDidUpdate(prevProps: Props) {
    if ((this.props.id !== prevProps.id) || (this.props.slug !== prevProps.slug)) {
      this.updateSubscription();
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  updateSubscription() {
    if (this.subscription) this.subscription.unsubscribe();

    let targetStream;
    if (this.props.slug) targetStream = userBySlugStream(this.props.slug);
    if (this.props.id) targetStream = userByIdStream(this.props.id);

    if (!targetStream) return;

    this.subscription = targetStream.observable
      .subscribe((response: IUser) => {
        this.setState({
          user: response.data
        });
      });
  }

  render() {
    const renderProps = {
      ...this.state
    };
    return this.props.children(renderProps);
  }
}
