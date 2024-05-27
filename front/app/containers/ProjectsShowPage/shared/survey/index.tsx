import React from 'react';

import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import { TSurveyService } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';

import globalMessages from 'utils/actionDescriptors/messages';
import { ProjectSurveyDisabledReason } from 'utils/actionDescriptors/types';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import ParticipationPermission from '../ParticipationPermission';

import EnalyzerSurvey from './EnalyzerSurvey';
import GoogleFormsSurvey from './GoogleFormsSurvey';
import messages from './messages';
import MicrosoftFormsSurvey from './MicrosoftFormsSurvey';
import QualtricsSurvey from './QualtricsSurvey';
import SmartSurvey from './SmartSurvey';
import SnapSurvey from './SnapSurvey';
import SurveymonkeySurvey from './SurveymonkeySurvey';
import SurveyXact from './SurveyXact';
import TypeformSurvey from './TypeformSurvey';


const Container = styled.div`
  position: relative;

  &.enabled {
    min-height: 500px;
  }
`;

interface Props {
  project: IProjectData;
  phaseId: string | null;
  surveyEmbedUrl: string;
  surveyService: TSurveyService;
  className?: string;
}

const disabledMessages: {
  [key in ProjectSurveyDisabledReason]: MessageDescriptor;
} = {
  project_inactive: messages.surveyDisabledProjectInactive,
  project_not_visible: messages.surveyDisabledNotPermitted,
  not_survey: messages.surveyDisabledNotActivePhase,
  user_not_active: messages.surveyDisabledNotActiveUser,
  user_not_verified: messages.surveyDisabledNotVerified,
  user_missing_requirements: messages.surveyDisabledNotActiveUser,
  user_not_signed_in: messages.surveyDisabledMaybeNotPermitted,
  user_not_in_group: globalMessages.defaultNotInGroup,
  user_not_permitted: messages.surveyDisabledNotPermitted,
  user_blocked: messages.surveyDisabledNotPermitted,
};

const Survey = ({
  project,
  phaseId,
  surveyEmbedUrl,
  surveyService,
  className,
}: Props) => {
  const { data: authUser } = useAuthUser();
  const { enabled, disabled_reason } =
    project.attributes.action_descriptors.taking_survey;
  const email =
    !isNilOrError(authUser) && authUser.data.attributes.email
      ? authUser.data.attributes.email
      : null;
  const userId = !isNilOrError(authUser) ? authUser.data.id : null;

  return (
    <ParticipationPermission
      id="project-survey"
      action="taking_survey"
      enabled={enabled}
      phaseId={phaseId}
      disabledMessage={
        disabled_reason ? disabledMessages[disabled_reason] : null
      }
    >
      <Container className={`${className} e2e-${surveyService}-survey enabled`}>
        <ProjectPageSectionTitle>
          <FormattedMessage {...messages.survey} />
        </ProjectPageSectionTitle>

        {surveyService === 'typeform' && (
          <TypeformSurvey
            typeformUrl={surveyEmbedUrl}
            email={email}
            user_id={userId}
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
            email={email}
            user_id={userId}
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
    </ParticipationPermission>
  );
};

export default Survey;
