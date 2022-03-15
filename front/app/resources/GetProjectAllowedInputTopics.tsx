import React from 'react';
import { IProjectAllowedInputTopicsState } from 'hooks/useProjectAllowedInputTopics';
import {
  IProjectAllowedInputTopicsResponse,
  listProjectAllowedInputTopics,
} from 'services/projectAllowedInputTopics';
import { isNilOrError, NilOrError } from 'utils/helperUtils';
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
    this.subscription = listProjectAllowedInputTopics(
      this.props.projectId
    ).observable.subscribe(
      (
        projectAllowedInputTopicsResponse:
          | IProjectAllowedInputTopicsResponse
          | NilOrError
      ) => {
        this.setState({
          projectAllowedInputTopics: isNilOrError(
            projectAllowedInputTopicsResponse
          )
            ? projectAllowedInputTopicsResponse
            : projectAllowedInputTopicsResponse.data,
        });
      }
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
