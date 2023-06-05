import React from 'react';

// components
import MetaInformation from '../MetaInformation';
import VoteControl from 'components/VoteControl';
import Buttons from 'containers/IdeasShow/CTABox/Buttons';
import AssignBudgetControl from 'components/AssignBudgetControl';

// styling
import styled from 'styled-components';
import { rightColumnWidthDesktop } from '../styleConstants';
import { colors } from 'utils/styleUtils';
import IdeaSharingButton from '../Buttons/IdeaSharingButton';
import SharingButtonComponent from '../Buttons/SharingButtonComponent';
import { Box } from '@citizenlab/cl2-component-library';

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

const StyledVoteControl = styled(VoteControl)`
  padding-bottom: 23px;
  margin-bottom: 23px;
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
  insideModal: boolean;
  anonymous?: boolean;
  className?: string;
}

const RightColumnDesktop = ({
  ideaId,
  projectId,
  statusId,
  authorId,
  insideModal,
  anonymous,
  className,
}: Props) => {
  return (
    <Container insideModal={insideModal} className={className || ''}>
      <InnerContainer>
        <Box
          padding="20px"
          borderRadius="3px"
          background={colors.background}
          mb="12px"
        >
          <StyledVoteControl styleType="shadow" ideaId={ideaId} size="4" />
          <StyledAssignBudgetControl
            view="ideaPage"
            ideaId={ideaId}
            projectId={projectId}
          />
          <Buttons ideaId={ideaId} />
        </Box>
        <Box mb="16px">
          <IdeaSharingButton
            ideaId={ideaId}
            buttonComponent={<SharingButtonComponent />}
          />
        </Box>
        <StyledMetaInformation
          ideaId={ideaId}
          projectId={projectId}
          statusId={statusId}
          authorId={authorId}
          anonymous={anonymous}
        />
      </InnerContainer>
    </Container>
  );
};

export default RightColumnDesktop;
