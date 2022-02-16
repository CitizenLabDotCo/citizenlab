import React from 'react';

// hooks
import {
  IProjectAllowedInputTopicsState,
  createObservable,
  createSubscription,
} from 'hooks/useProjectAllowedInputTopics';

// typings
import { Subscription } from 'rxjs';

interface State {
  projectAllowedInputTopics: IProjectAllowedInputTopicsState;
}

interface Props {
  projectId: string;
  children?: Children;
}

type Children = (
  renderProps: IProjectAllowedInputTopicsState
) => JSX.Element | null;

export default class GetProjectAllowedInputTopics extends React.Component<
  Props,
  State
> {
  private subscription: Subscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      projectAllowedInputTopics: undefined,
    };
  }

  setProjectAllowedInputTopics(
    projectAllowedInputTopics: IProjectAllowedInputTopicsState
  ) {
    this.setState({ projectAllowedInputTopics });
  }

  setSubscription() {
    const observable = createObservable(this.props.projectId);
    this.subscription = createSubscription(
      observable,
      this.setProjectAllowedInputTopics
    );
  }

  componentDidMount() {
    this.setSubscription();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.projectId !== prevProps.projectId) {
      this.subscription.unsubscribe();
      this.setSubscription();
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const { children } = this.props;
    const { projectAllowedInputTopics } = this.state;
    return (children as Children)(projectAllowedInputTopics);
  }
}
