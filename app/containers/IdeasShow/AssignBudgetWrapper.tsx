import React, { PureComponent } from 'react';

// components
import VotingPopContainer from './VotingPopContainer';
import AssignBudgetControl from 'components/AssignBudgetControl';
// import AssignBudgetDisabled from 'components/AssignBudgetControl/AssignBudgetDisabled';
import Unauthenticated from './Unauthenticated';


interface Props {
  ideaId: string;
  basketId: string | null | undefined;
  participationContextId: string;
  participationContextType: 'Phase' | 'Project';
}

interface State {
  error: 'unauthenticated' | null;
}

class AssignBudgetWrapper extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  unauthenticatedVoteClick = () => {
    this.setState({ error: 'unauthenticated' });
  }

  render() {
    const { ideaId, basketId, participationContextId, participationContextType } = this.props;
    const { error } = this.state;

    if (!error) {
      return (
        <AssignBudgetControl
          view="ideaPage"
          ideaId={ideaId}
          basketId={basketId}
          participationContextId={participationContextId}
          participationContextType={participationContextType}
          unauthenticatedVoteClick={this.unauthenticatedVoteClick}
        />
      );
    }

    if (error === 'unauthenticated') {
      return (
        <VotingPopContainer icon="lock-outlined">
          <Unauthenticated />
        </VotingPopContainer>
      );
    }

    return null;
  }
}

export default AssignBudgetWrapper;
