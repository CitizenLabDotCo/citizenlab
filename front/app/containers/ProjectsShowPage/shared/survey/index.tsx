import React from 'react';
import useAuthUser from 'hooks/useAuthUser';
// hooks
import usePhase from 'hooks/usePhase';
import useProject from 'hooks/useProject';
// services
import {
  getSurveyTakingRules,
  ISurveyTakingDisabledReason,
} from 'services/actionTakingRules';
// events
import { openSignUpInModal } from 'events/openSignUpInModal';
import { openVerificationModal } from 'events/verificationModal';
// i18n
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import { isError, isNilOrError } from 'utils/helperUtils';
import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';
import Warning from 'components/UI/Warning';
// styling
import styled from 'styled-components';
import EnalyzerSurvey from './EnalyzerSurvey';
import GoogleFormsSurvey from './GoogleFormsSurvey';
import MicrosoftFormsSurvey from './MicrosoftFormsSurvey';
import QualtricsSurvey from './QualtricsSurvey';
import SmartSurvey from './SmartSurvey';
import SnapSurvey from './SnapSurvey';
import SurveyXact from './SurveyXact';
import SurveymonkeySurvey from './SurveymonkeySurvey';
// components
import TypeformSurvey from './TypeformSurvey';
import messages from './messages';

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

const disabledMessage: {
  [key in ISurveyTakingDisabledReason]: MessageDescriptor;
} = {
  projectInactive: messages.surveyDisabledProjectInactive,
  maybeNotPermitted: messages.surveyDisabledMaybeNotPermitted,
  maybeNotVerified: messages.surveyDisabledMaybeNotVerified,
  notPermitted: messages.surveyDisabledNotPermitted,
  notActivePhase: messages.surveyDisabledNotActivePhase,
  notVerified: messages.surveyDisabledNotVerified,
};

const Survey = ({
  projectId,
  phaseId,
  surveyEmbedUrl,
  surveyService,
  className,
}: Props) => {
  const project = useProject({ projectId });
  const phase = usePhase(phaseId || null);
  const authUser = useAuthUser();

  const onVerify = () => {
    const pcId = phaseId || projectId;
    const pcType = phaseId ? 'phase' : 'project';

    if (pcId && pcType) {
      openVerificationModal({
        context: {
          action: 'taking_survey',
          id: pcId,
          type: pcType,
        },
      });
    }
  };

  const signUpIn = (flow: 'signin' | 'signup') => {
    if (!isNilOrError(project)) {
      const pcId = phaseId || projectId;
      const pcType = phaseId ? 'phase' : 'project';
      const takingSurveyDisabledReason =
        project.attributes?.action_descriptor?.taking_survey?.disabled_reason;

      openSignUpInModal({
        flow,
        verification: takingSurveyDisabledReason === 'not_verified',
        verificationContext:
          takingSurveyDisabledReason === 'not_verified' && pcId && pcType
            ? {
                action: 'taking_survey',
                id: pcId,
                type: pcType,
              }
            : undefined,
      });
    }
  };

  const signIn = () => {
    signUpIn('signin');
  };

  const signUp = () => {
    signUpIn('signup');
  };

  if (!isNilOrError(project)) {
    const { enabled, disabledReason } = getSurveyTakingRules({
      project,
      phaseContext: !isError(phase) ? phase : null,
      signedIn: !isNilOrError(authUser),
    });

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
        </Container>
      );
    }

    return (
      <Container className={`warning ${className || ''}`}>
        <Warning icon="lock">
          <FormattedMessage
            {...(disabledReason
              ? disabledMessage[disabledReason]
              : messages.surveyDisabledNotPossible)}
            values={{
              verificationLink: (
                <button onClick={onVerify}>
                  <FormattedMessage {...messages.verificationLinkText} />
                </button>
              ),
              signUpLink: (
                <button onClick={signUp}>
                  <FormattedMessage {...messages.signUpLinkText} />
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
