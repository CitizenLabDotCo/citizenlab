import React from 'react';
import styled from 'styled-components';
import BudgetAssignment from './BudgetAssignment';
import GoToCommentsButton from '../Buttons/GoToCommentsButton';
import useIdea from 'hooks/useIdea';
import { isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';

// typings
import { IParticipationContextType } from 'typings';

const Container = styled.div`
  border-radius: 2px;
  border-bottom: 1px solid ${colors.separation};
  margin-bottom: 30px;
`;

const BudgetAssignmentContainer = styled.div`
  background-color: #edeff0; // TODO: add color to component library
  padding: 25px 30px;
`;

const ButtonsContainer = styled.div`
  margin-bottom: 30px;
`;

const StyledGoToCommentsButton = styled(GoToCommentsButton)`
  margin-bottom: 10px;
  border: 1px solid #dddddd;
`;

interface Props {
  className?: string;
  participationContextId: string;
  participationContextType: IParticipationContextType;
  budgetingDescriptor: any;
  ideaId: string;
  projectId: string;
}

const ParticipatoryBudgettingCTABox = (props: Props) => {
  const { ideaId, className } = props;
  const idea = useIdea({ ideaId });

  if (!isNilOrError(idea)) {
    const commentingEnabled =
      idea.attributes.action_descriptor.commenting.enabled;

    // TODO: a11y title
    return (
      <Container>
        <BudgetAssignmentContainer className={className}>
          <BudgetAssignment {...props} />
        </BudgetAssignmentContainer>
        <ButtonsContainer>
          {commentingEnabled && <StyledGoToCommentsButton />}
        </ButtonsContainer>
      </Container>
    );
  }

  return null;
};

export default ParticipatoryBudgettingCTABox;
