// Libs
import React from 'react';
import { Subscription } from 'rxjs';
import { isEqual } from 'lodash';

// Services & utils
import { userByIdStream, userBySlugStream, IUserData } from 'services/users';
import { authUserStream } from 'services/auth';

// Typing
interface Props {
  id?: string;
  slug?: string;
  children: {(state: Partial<State>): any};
  current?: boolean;
}

interface State {
  user: IUserData | null;
}

export default class GetUser extends React.PureComponent<Props, State> {
  private sub: Subscription;

  constructor(props: Props) {
    super(props);

    this.state = {
      user: null,
    };
  }

  componentDidMount() {
    this.updateSub(this.props);
  }

  componentDidUpdate(prevProps: Props) {
    const { children: prevPropsChildren, ...prevPropsWithoutChildren } = prevProps;
    const { children: newPropsChildren, ...newPropsWithoutChildren } = this.props;

    if (!isEqual(newPropsWithoutChildren, prevPropsWithoutChildren)) {
      this.updateSub(this.props);
    }
  }

  componentWillUnmount() {
    this.sub.unsubscribe();
  }

  updateSub(props: Props) {
    if (this.sub) this.sub.unsubscribe();

    let targetStream;
    if (props.current) targetStream = authUserStream();
    if (props.id) targetStream = userByIdStream(props.id);
    if (props.slug) targetStream = userBySlugStream(props.slug);

    if (!targetStream) return;

    this.sub = targetStream.observable
    .subscribe((response) => {
      this.setState({
        user: response.data
      });
    });
  }

  render() {
    return this.props.children(this.state);
  }
}
