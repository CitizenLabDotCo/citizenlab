// Libraries
import React from 'react';
import styled from 'styled-components';
import { isError } from 'lodash-es';

// Services / Data loading
import GetPollQuestions, {
  GetPollQuestionsChildProps,
} from 'resources/GetPollQuestions';

// Components
import ExportPollButton from './ExportPollButton';
import PollAdminForm from './PollAdminForm';
import T from 'components/T';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import usePhases from 'api/phases/usePhases';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
const PhaseContainer = styled.div`
  &:not(:last-child) {
    margin-bottom: 50px;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;
`;

const Left = styled.div`
  margin-right: 80px;
`;

interface Props {
  projectId: string;
}

const AdminTimelineProjectPoll = ({ projectId }: Props) => {
  const localize = useLocalize();
  const { data: phases } = usePhases(projectId);
  const pollPhases = phases
    ? phases.data.filter(
        (phase) => phase.attributes.participation_method === 'poll'
      )
    : null;

  if (!pollPhases || pollPhases.length === 0) return null;

  return (
    <Container>
      <SectionTitle>
        <FormattedMessage {...messages.titlePollTab} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.pollTabSubtitle} />
      </SectionDescription>
      {pollPhases.map((phase) => (
        <PhaseContainer key={phase.id}>
          <HeaderContainer>
            <Left>
              <h3>
                <T value={phase.attributes.title_multiloc} />
              </h3>
            </Left>
            <ExportPollButton
              participationContextId={phase.id}
              participationContextType="phase"
              participationContextName={localize(
                phase.attributes.title_multiloc
              )}
            />
          </HeaderContainer>
          <GetPollQuestions
            participationContextId={phase.id}
            participationContextType="phase"
          >
            {(pollQuestions: GetPollQuestionsChildProps) => (
              <PollAdminForm
                participationContextType="phase"
                participationContextId={phase.id}
                pollQuestions={isError(pollQuestions) ? null : pollQuestions}
              />
            )}
          </GetPollQuestions>
        </PhaseContainer>
      ))}
    </Container>
  );
};

export default AdminTimelineProjectPoll;
