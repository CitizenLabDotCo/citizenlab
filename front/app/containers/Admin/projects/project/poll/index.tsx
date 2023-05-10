// Libraries
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
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
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { useParams } from 'react-router-dom';

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

const AdminProjectPoll = () => {
  const localize = useLocalize();
  const { projectId } = useParams() as { projectId: string };
  const project = useProject({ projectId });
  const phases = usePhases(projectId);
  const isEnabled = useFeatureFlag({ name: 'polls' });

  if (isNilOrError(project) || !isEnabled) return null;

  if (
    project.attributes.process_type === 'continuous' &&
    project.attributes.participation_method === 'poll'
  ) {
    return (
      <Container>
        <HeaderContainer>
          <Left>
            <SectionTitle>
              <FormattedMessage {...messages.titlePollTab} />
            </SectionTitle>
            <SectionDescription>
              <FormattedMessage {...messages.pollTabSubtitle} />
            </SectionDescription>
          </Left>
          <ExportPollButton
            participationContextType="project"
            participationContextId={project.id}
            participationContextName={localize(
              project.attributes.title_multiloc
            )}
          />
        </HeaderContainer>
        <GetPollQuestions
          participationContextId={project.id}
          participationContextType="project"
        >
          {(pollQuestions: GetPollQuestionsChildProps) => (
            <PollAdminForm
              participationContextType="project"
              participationContextId={project.id}
              pollQuestions={isError(pollQuestions) ? null : pollQuestions}
            />
          )}
        </GetPollQuestions>
      </Container>
    );
  }

  if (project.attributes.process_type === 'timeline' && !isNilOrError(phases)) {
    const pollPhases = phases.filter(
      (phase) => phase.attributes.participation_method === 'poll'
    );
    if (pollPhases.length === 0) return null;

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
  }
  return null;
};

export default AdminProjectPoll;
