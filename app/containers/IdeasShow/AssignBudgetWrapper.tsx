import React, { PureComponent } from 'react';
import { IParticipationContextType } from 'typings';

// components
import PopContainer from 'components/UI/PopContainer';
import AssignBudgetControl from 'components/AssignBudgetControl';
import AssignBudgetDisabled from 'components/AssignBudgetControl/AssignBudgetDisabled';

// services
import { IIdeaData } from 'services/ideas';

interface Props {
  ideaId: string;
  projectId: string;
  participationContextId: string;
  participationContextType: IParticipationContextType;
  budgetingDescriptor: IIdeaData['attributes']['action_descriptor']['budgeting'];
}

interface State {
  error: 'budgetingDisabled' | null;
}

class AssignBudgetWrapper extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  disabledBudgetingClick = () => {
    this.setState({ error: 'budgetingDisabled' });
  }

  render() {
    const { ideaId, participationContextId, participationContextType, budgetingDescriptor, projectId } = this.props;
    const { error } = this.state;

    return (
      <div aria-live="polite">
        {!error &&
          <AssignBudgetControl
            view="ideaPage"
            ideaId={ideaId}
            participationContextId={participationContextId}
            participationContextType={participationContextType}
            disabledAssignBudgetClick={this.disabledBudgetingClick}
            projectId={projectId}
          />
        }
        {error === 'budgetingDisabled' &&
          <PopContainer icon="lock-outlined">
            <AssignBudgetDisabled
              participationContextId={participationContextId}
              participationContextType={participationContextType}
              budgetingDescriptor={budgetingDescriptor}
            />
          </PopContainer>
        }
      </div>
    );
  }
}

export default AssignBudgetWrapper;
