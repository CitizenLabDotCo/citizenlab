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
  padding-bottom: 30px;
  border-bottom: 1px solid ${colors.separation};
`;

const StyledBudgetAssignment = styled(BudgetAssignment)`
  margin-bottom: 30px;
`;

const StyledGoToCommentsButton = styled(GoToCommentsButton)`
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

const ParticipatoryBudgetingCTABox = (props: Props) => {
  const { ideaId } = props;
  const idea = useIdea({ ideaId });

  if (!isNilOrError(idea)) {
    const commentingEnabled =
      idea.attributes.action_descriptor.commenting.enabled;

    // TODO: a11y title
    return (
      <Container>
        <StyledBudgetAssignment {...props} />
        {commentingEnabled && <StyledGoToCommentsButton />}
      </Container>
    );
  }

  return null;
};

export default ParticipatoryBudgetingCTABox;
