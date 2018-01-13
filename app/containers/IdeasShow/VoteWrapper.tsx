import * as React from 'react';

import VotingPopContainer from './VotingPopContainer';
import VoteControl from 'components/VoteControl';
import VotingDisabled from 'components/VoteControl/VotingDisabled';
import Unauthenticated from './Unauthenticated';

import { IIdeaData } from 'services/ideas';


type Props = {
  ideaId?: string;
  votingDescriptor: IIdeaData['relationships']['action_descriptor']['data']['voting'];
  projectId: string;
};

type State = {
  error: 'votingDisabled' | 'unauthenticated' | null;
};

class VoteWrapper extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  unauthenticatedVoteClick = () => {
    this.setState({ error: 'unauthenticated' });
  }

  disabledVoteClick = () => {
    this.setState({ error: 'votingDisabled' });
  }

  render() {
    const { error } = this.state;
    if (!this.props.ideaId) return null;
    return (
      <React.Fragment>
        {!error &&
          <VoteControl
            ideaId={this.props.ideaId}
            unauthenticatedVoteClick={this.unauthenticatedVoteClick}
            disabledVoteClick={this.disabledVoteClick}
            size="normal"
          />
        }
        {error === 'votingDisabled' &&
          <VotingPopContainer icon="lock-outlined">
            <VotingDisabled
              votingDescriptor={this.props.votingDescriptor}
              projectId={this.props.projectId}
            />
          </VotingPopContainer>
        }
        {error === 'unauthenticated' &&
          <VotingPopContainer icon="lock-outlined">
            <Unauthenticated />
          </VotingPopContainer>
        }
      </React.Fragment>
    );
  }
}

export default VoteWrapper;
