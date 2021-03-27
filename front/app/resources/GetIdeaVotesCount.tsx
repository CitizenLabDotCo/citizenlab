import React from 'react';
import { Subscription } from 'rxjs';
import { votesStream } from 'services/ideaVotes';

interface InputProps {}

type children = (
  renderProps: GetIdeaVotesCountChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  ideaId: string;
  children?: children;
}

type votesCount = {
  up: number;
  down: number;
};

interface State {
  ideaVotesCount: votesCount | undefined | null;
}

export type GetIdeaVotesCountChildProps = votesCount | undefined | null;

export default class GetIdeaVotesCount extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      ideaVotesCount: undefined,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      votesStream(this.props.ideaId).observable.subscribe((ideaVotes) => {
        this.setState({
          ideaVotesCount: ideaVotes
            ? {
                up: ideaVotes.data.filter(
                  (vote) => vote.attributes.mode === 'up'
                ).length,
                down: ideaVotes.data.filter(
                  (vote) => vote.attributes.mode === 'down'
                ).length,
              }
            : null,
        });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { ideaVotesCount } = this.state;
    return (children as children)(ideaVotesCount);
  }
}
