import React from 'react';

// hooks
import {
  IProjectAllowedInputTopicsState,
  createObservable,
  createSubscription,
} from 'hooks/useProjectAllowedInputTopics';

// typings
import { Subscription } from 'rxjs';
import { ITopicData } from 'services/topics';
import { isNilOrError } from 'utils/helperUtils';

interface State {
  projectAllowedInputTopics: IProjectAllowedInputTopicsState;
}

interface Props {
  projectId: string;
  getNestedTopicData?: boolean;
  children?: Children;
}

type Children = (
  renderProps: IProjectAllowedInputTopicsState | ITopicData[]
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
    const { children, getNestedTopicData } = this.props;
    const { projectAllowedInputTopics } = this.state;

    if (!getNestedTopicData || isNilOrError(projectAllowedInputTopics)) {
      return (children as Children)(projectAllowedInputTopics);
    }

    const nestedTopicData = projectAllowedInputTopics.map(
      ({ topicData }) => topicData
    );

    return (children as Children)(nestedTopicData);
  }
}
