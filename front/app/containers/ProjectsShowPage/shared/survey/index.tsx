import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import TypeformSurvey from './TypeformSurvey';
import SurveymonkeySurvey from './SurveymonkeySurvey';
import GoogleFormsSurvey from './GoogleFormsSurvey';
import EnalyzerSurvey from './EnalyzerSurvey';
import QualtricsSurvey from './QualtricsSurvey';
import SmartSurvey from './SmartSurvey';
import MicrosoftFormsSurvey from './MicrosoftFormsSurvey';
import SnapSurvey from './SnapSurvey';
import KonveioSurvey from './KonveioSurvey';
import Warning from 'components/UI/Warning';
import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useProjectById from 'api/projects/useProjectById';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// styling
import styled from 'styled-components';
import SurveyXact from './SurveyXact';
import usePhase from 'api/phases/usePhase';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

const Container = styled.div`
  position: relative;

  &.enabled {
    min-height: 500px;
  }
`;

interface Props {
  projectId: string | null;
  phaseId?: string | null;
  surveyEmbedUrl: string;
  surveyService: string;
  className?: string;
}

const disabledMessages = {
  project_inactive: messages.surveyDisabledProjectInactive,
  not_active: messages.surveyDisabledNotActiveUser,
  not_verified: messages.surveyDisabledNotVerified,
  missing_data: messages.surveyDisabledNotActiveUser,
  not_signed_in: messages.surveyDisabledMaybeNotPermitted,
} as const;

const Survey = ({
  projectId,
  phaseId,
  surveyEmbedUrl,
  surveyService,
  className,
}: Props) => {
  const { data: project } = useProjectById(projectId);
  const authUser = useAuthUser();
  const { data: phase } = usePhase(phaseId ?? null);

  const signUpIn = (flow: 'signin' | 'signup') => {
    if (!isNilOrError(project)) {
      const pcType = phaseId ? 'phase' : 'project';
      const pcId = phaseId ?? projectId;

      if (!pcId || !pcType) return;

      triggerAuthenticationFlow({
        flow,
        context: {
          action: 'taking_survey',
          id: pcId,
          type: pcType,
        },
      });
    }
  };

  const signIn = () => {
    signUpIn('signin');
  };

  const signUp = () => {
    signUpIn('signup');
  };

  if (project) {
    const { enabled, disabled_reason } =
      project.data.attributes.action_descriptor.taking_survey;

    if (enabled) {
      const email = !isNilOrError(authUser) ? authUser.attributes.email : null;
      const user_id = !isNilOrError(authUser) ? authUser.id : null;
      const language = !isNilOrError(authUser)
        ? authUser.attributes.locale
        : undefined;

      return (
        <Container
          id="project-survey"
          className={`${className} e2e-${surveyService}-survey enabled`}
        >
          <ProjectPageSectionTitle>
            <FormattedMessage {...messages.survey} />
          </ProjectPageSectionTitle>

          {surveyService === 'typeform' && (
            <TypeformSurvey
              typeformUrl={surveyEmbedUrl}
              email={email || null}
              user_id={user_id}
              language={language || undefined}
            />
          )}

          {surveyService === 'survey_monkey' && (
            <SurveymonkeySurvey surveymonkeyUrl={surveyEmbedUrl} />
          )}

          {surveyService === 'google_forms' && (
            <GoogleFormsSurvey googleFormsUrl={surveyEmbedUrl} />
          )}

          {surveyService === 'enalyzer' && (
            <EnalyzerSurvey enalyzerUrl={surveyEmbedUrl} />
          )}

          {surveyService === 'qualtrics' && (
            <QualtricsSurvey qualtricsUrl={surveyEmbedUrl} />
          )}

          {surveyService === 'smart_survey' && (
            <SmartSurvey
              smartSurveyUrl={surveyEmbedUrl}
              email={email || null}
              user_id={user_id}
            />
          )}

          {surveyService === 'microsoft_forms' && (
            <MicrosoftFormsSurvey microsoftFormsUrl={surveyEmbedUrl} />
          )}

          {surveyService === 'survey_xact' && (
            <SurveyXact surveyXactUrl={surveyEmbedUrl} />
          )}

          {surveyService === 'snap_survey' && (
            <SnapSurvey snapSurveyUrl={surveyEmbedUrl} />
          )}

          {surveyService === 'konveio' && (
            <KonveioSurvey
              konveioSurveyUrl={surveyEmbedUrl}
              email={email || null}
            />
          )}
        </Container>
      );
    }

    const notCurrentPhase =
      project.data.attributes.process_type === 'timeline' &&
      phase &&
      pastPresentOrFuture([
        phase.data.attributes.start_at,
        phase.data.attributes.end_at,
      ]) !== 'present';

    const message = notCurrentPhase
      ? messages.surveyDisabledNotActivePhase
      : disabledMessages[disabled_reason] ?? messages.surveyDisabledNotPossible;

    return (
      <Container className={`warning ${className || ''}`}>
        <Warning icon="lock">
          <FormattedMessage
            {...message}
            values={{
              verificationLink: (
                <button onClick={signUp}>
                  <FormattedMessage {...messages.verificationLinkText} />
                </button>
              ),
              signUpLink: (
                <button onClick={signUp}>
                  <FormattedMessage {...messages.signUpLinkText} />
                </button>
              ),
              completeRegistrationLink: (
                <button onClick={signUp}>
                  <FormattedMessage
                    {...messages.completeRegistrationLinkText}
                  />
                </button>
              ),
              logInLink: (
                <button onClick={signIn}>
                  <FormattedMessage {...messages.logInLinkText} />
                </button>
              ),
            }}
          />
        </Warning>
      </Container>
    );
  }

  return null;
};

export default Survey;
