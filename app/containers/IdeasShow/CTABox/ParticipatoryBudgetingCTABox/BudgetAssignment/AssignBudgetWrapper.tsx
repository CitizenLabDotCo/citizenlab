import React, { memo, useState } from 'react';
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

const AssignBudgetWrapper = memo(
  ({
    ideaId,
    participationContextId,
    participationContextType,
    budgetingDescriptor,
    projectId,
  }: Props) => {
    const [error, setError] = useState<'budgetingDisabled' | null>(null);

    const disabledBudgetingClick = () => {
      setError('budgetingDisabled');
    };

    return (
      <div aria-live="polite">
        {!error && (
          <AssignBudgetControl
            view="ideaPage"
            ideaId={ideaId}
            participationContextId={participationContextId}
            participationContextType={participationContextType}
            disabledAssignBudgetClick={disabledBudgetingClick}
            projectId={projectId}
          />
        )}
        {error === 'budgetingDisabled' && (
          <PopContainer icon="lock-outlined">
            <AssignBudgetDisabled
              participationContextId={participationContextId}
              participationContextType={participationContextType}
              budgetingDescriptor={budgetingDescriptor}
            />
          </PopContainer>
        )}
      </div>
    );
  }
);

export default AssignBudgetWrapper;
