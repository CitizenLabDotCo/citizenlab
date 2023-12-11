// Libraries
import React from 'react';
import styled from 'styled-components';
import { isError } from 'lodash-es';
import { useParams } from 'react-router-dom';

// Services / Data loading
import GetPollQuestions, {
  GetPollQuestionsChildProps,
} from 'resources/GetPollQuestions';

// Components
import ExportPollButton from './ExportPollButton';
import PollAdminForm from './PollAdminForm';
import { SectionDescription } from 'components/admin/Section';
import { Box, Title } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';

// hooks
import usePhase from 'api/phases/usePhase';
import useFeatureFlag from 'hooks/useFeatureFlag';

const PhaseContainer = styled.div`
  &:not(:last-child) {
    margin-bottom: 50px;
  }
`;

const AdminProjectPoll = () => {
  const { phaseId } = useParams() as {
    phaseId?: string;
  };
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
