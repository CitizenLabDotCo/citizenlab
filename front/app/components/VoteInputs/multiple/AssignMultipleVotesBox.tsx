import React, { memo } from 'react';

// api
import useIdeaById from 'api/ideas/useIdeaById';

// components
import WhiteBox from '../_shared/WhiteBox';
import AssignMultipleVotesControl from './AssignMultipleVotesInput';
import { Box } from '@citizenlab/cl2-component-library';
import VotesCounter from 'components/VotesCounter';

// i18n
import messages from '../_shared/messages';
import { FormattedMessage } from 'utils/cl-intl';

// styles
import { colors } from 'utils/styleUtils';

// typings
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

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
      <WhiteBox>
        <AssignMultipleVotesControl
          ideaId={ideaId}
          participationContext={participationContext}
          onIdeaPage
        />
        <Box
          color={colors.grey700}
          mt="8px"
          display="flex"
          width="100%"
          justifyContent="center"
        >
          <FormattedMessage {...messages.youHave} />
          <Box ml="4px">
            <VotesCounter participationContext={participationContext} />
          </Box>
        </Box>
      </WhiteBox>
    );
  }
);

export default AssignMultipleVotesBox;
