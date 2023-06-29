import React from 'react';

// components
import MetaInformation from '../MetaInformation';
import ReactionControl from 'components/ReactionControl';
import Buttons from 'containers/IdeasShow/components/CTABox/Buttons';
import AssignBudgetControl from 'components/AssignBudgetControl';

// styling
import styled from 'styled-components';
import { rightColumnWidthDesktop } from '../../styleConstants';
import { colors } from 'utils/styleUtils';
import IdeaSharingButton from '../Buttons/IdeaSharingButton';
import SharingButtonComponent from '../Buttons/SharingButtonComponent';
import { Box } from '@citizenlab/cl2-component-library';

const Container = styled.div`
  flex: 0 0 ${rightColumnWidthDesktop}px;
  width: ${rightColumnWidthDesktop}px;
  position: sticky;
  top: 110px;
  align-self: flex-start;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledReactionControl = styled(ReactionControl)`
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
  anonymous?: boolean;
  className?: string;
}

const RightColumnDesktop = ({
  ideaId,
  projectId,
  statusId,
  authorId,
  anonymous,
  className,
}: Props) => {
  return (
    <Container className={className || ''}>
      <InnerContainer>
        <Box
          padding="20px"
          borderRadius="3px"
          background={colors.background}
          mb="12px"
        >
          <StyledReactionControl styleType="shadow" ideaId={ideaId} size="4" />
          <StyledAssignBudgetControl ideaId={ideaId} projectId={projectId} />
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
