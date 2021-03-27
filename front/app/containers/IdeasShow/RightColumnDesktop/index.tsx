import React from 'react';
import { IParticipationContextType } from 'typings';

// components
import MetaInformation from '../MetaInformation';
import VotingCTABox from '../CTABox/VotingCTABox';
import ParticipatoryBudgetingCTABox from '../CTABox/ParticipatoryBudgetingCTABox';
import Buttons from '../CTABox/Buttons';

// styling
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';
import {
  rightColumnWidthDesktop,
  rightColumnWidthTablet,
} from '../styleConstants';

const Container = styled.div<{ insideModal: boolean }>`
  flex: 0 0 ${rightColumnWidthDesktop}px;
  width: ${rightColumnWidthDesktop}px;
  position: sticky;
  top: ${(props) => (props.insideModal ? '30px' : '110px')};
  align-self: flex-start;

  ${media.tablet`
    flex: 0 0 ${rightColumnWidthTablet}px;
    width: ${rightColumnWidthTablet}px;
  `}

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledVotingCTABox = styled(VotingCTABox)`
  margin-bottom: 23px;
`;

const StyledPBCTABox = styled(ParticipatoryBudgetingCTABox)`
  margin-bottom: 23px;
`;

const ButtonsFallback = styled.div`
  background-color: ${colors.background};
  border-radius: 2px;
  padding: 25px 15px;
  margin-bottom: 23px;
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
  budgetingDescriptor: any | null;
  insideModal: boolean;
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
  budgetingDescriptor,
  insideModal,
}: Props) => {
  return (
    <Container insideModal={insideModal}>
      <InnerContainer>
        {showVoteControl && (
          <StyledVotingCTABox ideaId={ideaId} projectId={projectId} />
        )}
        {showBudgetControl &&
          participationContextId &&
          participationContextType &&
          budgetingDescriptor && (
            <StyledPBCTABox
              ideaId={ideaId}
              projectId={projectId}
              participationContextId={participationContextId}
              participationContextType={participationContextType}
              budgetingDescriptor={budgetingDescriptor}
            />
          )}
        {!showVoteControl && !showBudgetControl && (
          <ButtonsFallback>
            <Buttons ideaId={ideaId} />
          </ButtonsFallback>
        )}
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
