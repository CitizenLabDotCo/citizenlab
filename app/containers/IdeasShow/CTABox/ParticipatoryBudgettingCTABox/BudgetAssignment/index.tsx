import React from 'react';
import styled from 'styled-components';

// components
import AssignBudgetWrapper from './AssignBudgetWrapper';

// typings
import { IParticipationContextType } from 'typings';

// styling
import { defaultCardStyle } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const ControlWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 35px;
  border: 1px solid #e0e0e0;
  ${defaultCardStyle};
`;

interface Props {
  participationContextId: string;
  participationContextType: IParticipationContextType;
  budgetingDescriptor: any;
  ideaId: string;
  projectId: string;
}

const BudgetAsssignment = ({
  participationContextId,
  participationContextType,
  budgetingDescriptor,
  ideaId,
  projectId,
}: Props) => {
  return (
    <ControlWrapper className="e2e-vote-controls-desktop">
      {participationContextId &&
        participationContextType &&
        budgetingDescriptor && (
          <>
            <ScreenReaderOnly>
              <FormattedMessage tagName="h2" {...messages.a11y_budgetControl} />
            </ScreenReaderOnly>
            <AssignBudgetWrapper
              ideaId={ideaId}
              projectId={projectId}
              participationContextId={participationContextId}
              participationContextType={participationContextType}
              budgetingDescriptor={budgetingDescriptor}
            />
          </>
        )}
    </ControlWrapper>
  );
};

export default BudgetAsssignment;
