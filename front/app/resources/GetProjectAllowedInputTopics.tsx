import React from 'react';

// hooks
import {
  createSubscription,
  IProjectAllowedInputTopicsState,
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
    this.subscription = createSubscription(
      this.props.projectId,
      this.setProjectAllowedInputTopics.bind(this)
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
