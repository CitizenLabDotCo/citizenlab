import React from 'react';
import { IParticipationContextType } from 'typings';

// components
import MetaInformation from '../MetaInformation';
import Voting from 'containers/IdeasShow/CTABox/VotingCTABox/Voting';
import Buttons from 'containers/IdeasShow/CTABox/Buttons';
import AssignBudgetControl from 'components/AssignBudgetControl';

// styling
import styled from 'styled-components';
import { rightColumnWidthDesktop } from '../styleConstants';
import { colors } from 'utils/styleUtils';

const Container = styled.div<{ insideModal: boolean }>`
  flex: 0 0 ${rightColumnWidthDesktop}px;
  width: ${rightColumnWidthDesktop}px;
  position: sticky;
  top: ${(props) => (props.insideModal ? '30px' : '110px')};
  align-self: flex-start;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Box = styled.div`
  padding: 20px;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${colors.backgroundLightGrey};
  margin-bottom: 30px;
`;

const StyledVoting = styled(Voting)`
  padding-bottom: 23px;
  margin-bottom: 23px;
  border-bottom: solid 1px #ccc;
`;

const StyledAssignBudgetControl = styled(AssignBudgetControl)`
  padding-bottom: 23px;
  margin-bottom: 23px;
  border-bottom: solid 1px #ccc;
`;

const StyledMetaInformation = styled(MetaInformation)`
  margin-bottom: 40px;
`;

interface Props {
  ideaId: string;
  projectId: string;
  statusId: string;
  authorId: string | null;
  showVoteControl: boolean | null;
  showBudgetControl: boolean | null;
  participationContextId: string | null;
  participationContextType: IParticipationContextType | null;
  insideModal: boolean;
  className?: string;
}

const RightColumnDesktop = ({
  ideaId,
  projectId,
  statusId,
  authorId,
  showVoteControl,
  showBudgetControl,
  participationContextId,
  participationContextType,
  insideModal,
  className,
}: Props) => {
  return (
    <Container insideModal={insideModal} className={className || ''}>
      <InnerContainer>
        <Box>
          {showVoteControl && (
            <StyledVoting ideaId={ideaId} projectId={projectId} />
          )}

          {showBudgetControl &&
            participationContextId &&
            participationContextType && (
              <StyledAssignBudgetControl
                view="ideaPage"
                ideaId={ideaId}
                projectId={projectId}
                participationContextId={participationContextId}
                participationContextType={participationContextType}
              />
            )}

          <Buttons ideaId={ideaId} />
        </Box>

        <StyledMetaInformation
          ideaId={ideaId}
          projectId={projectId}
          statusId={statusId}
          authorId={authorId}
        />
      </InnerContainer>
    </Container>
  );
};

export default RightColumnDesktop;
