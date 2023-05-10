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
import { SectionTitle, SectionDescription } from 'components/admin/Section';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import useProject from 'hooks/useProject';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { useParams } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
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

const AdminContinuousProjectPoll = () => {
  const localize = useLocalize();
  const { projectId } = useParams() as { projectId: string };
  const project = useProject({ projectId });

  if (isNilOrError(project)) return null;

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
          participationContextName={localize(project.attributes.title_multiloc)}
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
};

export default AdminContinuousProjectPoll;
