import React, { memo } from 'react';

// api
import useIdeaById from 'api/ideas/useIdeaById';

// components
import AssignMultipleVotesControl from './AssignMultipleVotesInput';
import { Text } from '@citizenlab/cl2-component-library';
import VotesCounter from 'components/VotesCounter';

// styles
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

// typings
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

const IdeaPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  ${media.tablet`
    padding: 20px;
    background: ${colors.background};
  `}
`;

interface Props {
  ideaId: string;
  participationContext: IProjectData | IPhaseData;
}

const AssignMultipleVotesBox = memo(
  ({ ideaId, participationContext }: Props) => {
    const { data: idea } = useIdeaById(ideaId);
    const actionDescriptor = idea?.data.attributes.action_descriptor.voting;

    if (!actionDescriptor) {
      return null;
    }

    return (
      <IdeaPageContainer>
        <AssignMultipleVotesControl
          ideaId={ideaId}
          participationContext={participationContext}
        />
        <Text mb="0px" mt="8px" color="grey600" fontSize="xs">
          <VotesCounter participationContext={participationContext} />
        </Text>
      </IdeaPageContainer>
    );
  }
);

export default AssignMultipleVotesBox;
