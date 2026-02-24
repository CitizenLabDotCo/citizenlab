import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { isError } from 'lodash-es';
import GetPollQuestions, {
  GetPollQuestionsChildProps,
} from 'resources/GetPollQuestions';
import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import { SectionDescription } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import ExportPollButton from './ExportPollButton';
import messages from './messages';
import PollAdminForm from './PollAdminForm';

const PhaseContainer = styled.div`
  &:not(:last-child) {
    margin-bottom: 50px;
  }
`;

const AdminProjectPoll = () => {
  const { phaseId } = useParams({
    from: '/$locale/admin/projects/$projectId/phases/$phaseId/polls',
  });
  const { data: phase } = usePhase(phaseId);
  const isEnabled = useFeatureFlag({ name: 'polls' });
  const localize = useLocalize();

  if (
    !phase ||
    phase.data.attributes.participation_method !== 'poll' ||
    !isEnabled
  ) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Title variant="h3" color="primary">
          <FormattedMessage {...messages.titlePollTab} />
        </Title>
        <ExportPollButton
          phaseId={phase.data.id}
          phaseName={localize(phase.data.attributes.title_multiloc)}
        />
      </Box>
      <SectionDescription>
        <FormattedMessage {...messages.pollTabSubtitle} />
      </SectionDescription>
      <PhaseContainer>
        <GetPollQuestions phaseId={phase.data.id}>
          {(pollQuestions: GetPollQuestionsChildProps) => (
            <PollAdminForm
              phaseId={phase.data.id}
              pollQuestions={isError(pollQuestions) ? null : pollQuestions}
            />
          )}
        </GetPollQuestions>
      </PhaseContainer>
    </Box>
  );
};

export default AdminProjectPoll;
