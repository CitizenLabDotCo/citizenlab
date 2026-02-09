import React from 'react';

import {
  Box,
  IconTooltip,
  Input,
  IOption,
} from '@citizenlab/cl2-component-library';
import { CLErrors, Multiloc } from 'typings';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import {
  IdeaSortMethod,
  InputTerm,
  IPhase,
  IUpdatedPhaseProperties,
  ParticipationMethod,
  PresentationMode,
  PrescreeningMode,
  TSurveyService,
  VoteTerm,
  VotingMethod,
} from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import projectMessages from 'containers/Admin/projects/project/general/messages';

import anonymousMessages from 'components/admin/AnonymousPostingToggle/messages';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { anyIsDefined } from 'utils/helperUtils';

import { ValidationErrors } from '../../typings';

import UserActions from './components/inputs/_shared/UserActions';
import IdeationInputs from './components/inputs/IdeationInputs';
import NativeSurveyInputs from './components/inputs/NativeSurveyInputs';
import PollInputs from './components/inputs/PollInputs';
import ProposalsInputs from './components/inputs/ProposalsInputs';
import SurveyInputs from './components/inputs/SurveyInputs';
import VotingInputs from './components/inputs/VotingInputs';
import ParticipationMethodPicker from './components/ParticipationMethodPicker';
import { Container, StyledSection } from './components/shared/styling';
import messages from './messages';
import {
  defaultParticipationConfig,
  ideationDefaultConfig,
  nativeSurveyDefaultConfig,
  proposalsDefaultConfig,
  surveyDefaultConfig,
  votingDefaultConfig,
} from './utils/participationMethodConfigs';

interface Props {
  phase?: IPhase;
  formData: IUpdatedPhaseProperties;
  validationErrors: ValidationErrors;
  apiErrors: CLErrors | null;
  onChange: (arg: IUpdatedPhaseProperties) => void;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

const MAX_VOTES_PER_VOTING_METHOD: Record<VotingMethod, number> = {
  single_voting: 1,
  multiple_voting: 10,
  budgeting: 100,
};

type SetFn = (config: IUpdatedPhaseProperties) => IUpdatedPhaseProperties;

const PhaseParticipationConfig = ({
  phase,
  formData,
  validationErrors,
  apiErrors,
  onChange,
  setValidationErrors,
}: Props) => {
  const surveys_enabled = useFeatureFlag({ name: 'surveys' });
  const typeform_enabled = useFeatureFlag({ name: 'typeform_surveys' });
  const google_forms_enabled = useFeatureFlag({ name: 'google_forms_surveys' });
  const survey_monkey_enabled = useFeatureFlag({
    name: 'surveymonkey_surveys',
  });
  const enalyzer_enabled = useFeatureFlag({ name: 'enalyzer_surveys' });
  const survey_xact_enabled = useFeatureFlag({ name: 'survey_xact_surveys' });
  const qualtrics_enabled = useFeatureFlag({ name: 'qualtrics_surveys' });
  const smartsurvey_enabled = useFeatureFlag({ name: 'smart_survey_surveys' });
  const snap_survey_enabled = useFeatureFlag({ name: 'snap_survey_surveys' });
  const microsoft_forms_enabled = useFeatureFlag({
    name: 'microsoft_forms_surveys',
  });

  const project_library_enabled = useFeatureFlag({ name: 'project_library' });

  const { formatMessage } = useIntl();

  const { data: permissions } = usePhasePermissions({
    phaseId: phase?.data.id,
  });

  // If posting without an account is allowed, we allow logged-in users to post
  // anonymously.
  const toggleAnonymousPostingDisabledReason =
    permissions?.data.find((p) => p.attributes.action === 'posting_idea')
      ?.attributes.permitted_by === 'everyone'
      ? formatMessage(anonymousMessages.anonymousParticipationAutoEnabled)
      : undefined;

  const updateFormData = (fn: SetFn) => {
    const updatedFormData = fn(formData);
    onChange(updatedFormData);
  };

  const handleParticipationMethodOnChange = (
    participation_method: ParticipationMethod
  ) => {
    const ideation = participation_method === 'ideation';
    const native_survey = participation_method === 'native_survey';
    const voting = participation_method === 'voting';
    const survey = participation_method === 'survey';
    const proposals = participation_method === 'proposals';

    updateFormData(() => ({
      // These two lines should not be needed as we use defaultParticipationConfig
      // already in the participationMethodConfigs.ts file for each specific config
      // as its starting point.
      ...defaultParticipationConfig,
      participation_method,
      ...(ideation ? ideationDefaultConfig : {}),
      ...(voting ? votingDefaultConfig : {}),
      ...(survey ? surveyDefaultConfig : {}),
      ...(native_survey ? nativeSurveyDefaultConfig : {}),
      ...(proposals ? proposalsDefaultConfig : {}),
    }));
  };

  const handleSurveyProviderChange = (survey_service: TSurveyService) => {
    updateFormData((state) => ({
      ...state,
      survey_service,
    }));
  };

  const handleSurveyEmbedUrlChange = (survey_embed_url: string) => {
    updateFormData((state) => ({
      ...state,
      survey_embed_url,
    }));
  };

  const handleDocumentAnnotationEmbedUrlChange = (
    document_annotation_embed_url: string
  ) => {
    updateFormData((state) => ({
      ...state,
      document_annotation_embed_url,
    }));
  };

  const togglePostingEnabled = () => {
    updateFormData((state) => ({
      ...state,
      submission_enabled: !state.submission_enabled,
    }));
  };

  const toggleCommentingEnabled = () => {
    updateFormData((state) => ({
      ...state,
      commenting_enabled: !state.commenting_enabled,
    }));
  };

  const toggleAutoshareResultsEnabled = () => {
    updateFormData((state) => ({
      ...state,
      autoshare_results_enabled: !state.autoshare_results_enabled,
    }));
  };

  const toggleReactingEnabled = () => {
    updateFormData((state) => ({
      ...state,
      reacting_enabled: !state.reacting_enabled,
    }));
  };

  const handleReactingLikeMethodOnChange = (
    reacting_like_method: 'unlimited' | 'limited'
  ) => {
    updateFormData((state) => ({
      ...state,
      reacting_like_method,
      reacting_like_limited_max:
        reacting_like_method === 'unlimited' ? null : 5,
    }));
  };

  const handleLikingLimitOnChange = (reacting_like_limited_max: string) => {
    updateFormData((state) => ({
      ...state,
      reacting_like_limited_max: parseInt(reacting_like_limited_max, 10),
    }));
    setValidationErrors((errors) => ({
      ...errors,
      noLikingLimitError: undefined,
    }));
  };

  const handleReactingDislikeEnabledOnChange = (
    reacting_dislike_enabled: boolean
  ) => {
    updateFormData((state) => ({
      ...state,
      reacting_dislike_enabled,
    }));
  };

  const handleAllowAnonymousParticipationOnChange = (
    allow_anonymous_participation: boolean
  ) => {
    updateFormData((state) => ({
      ...state,
      allow_anonymous_participation,
    }));
  };

  const handleVotingMethodOnChange = (voting_method: VotingMethod) => {
    const maxVotes = MAX_VOTES_PER_VOTING_METHOD[voting_method];

    updateFormData((state) => ({
      ...state,
      voting_method,
      voting_max_votes_per_idea:
        voting_method === 'single_voting' ? 1 : state.voting_max_votes_per_idea,
      voting_max_total: maxVotes,
    }));
  };

  const handleReactingDislikeMethodOnChange = (
    reacting_dislike_method: 'unlimited' | 'limited'
  ) => {
    updateFormData((state) => ({
      ...state,
      reacting_dislike_method,
      reacting_dislike_limited_max:
        reacting_dislike_method === 'unlimited' ? null : 5,
    }));
  };

  const handleDislikingLimitOnChange = (
    rreacting_dislike_limited_max: string
  ) => {
    updateFormData((state) => ({
      ...state,
      reacting_dislike_limited_max: parseInt(rreacting_dislike_limited_max, 10),
    }));
    setValidationErrors((errors) => ({
      ...errors,
      noDislikingLimitError: undefined,
    }));
  };

  const handleIdeasDisplayChange = (presentation_mode: PresentationMode) => {
    updateFormData((state) => ({
      ...state,
      presentation_mode,
    }));
  };

  const handleIdeaDefaultSortMethodChange = (ideas_order: IdeaSortMethod) => {
    updateFormData((state) => ({
      ...state,
      ideas_order,
    }));
  };

  const handleVotingMinTotalChange = (newVotingMinTotal: string) => {
    const voting_min_total = parseInt(newVotingMinTotal, 10);
    updateFormData((state) => ({
      ...state,
      voting_min_total,
    }));
    setValidationErrors((errors) => ({
      ...errors,
      minTotalVotesError: undefined,
    }));
  };

  const handleVotingMaxTotalChange = (newVotingMaxTotal: string | null) => {
    const voting_max_total = newVotingMaxTotal
      ? parseInt(newVotingMaxTotal, 10)
      : null;
    updateFormData((state) => ({
      ...state,
      voting_max_total,
    }));
    setValidationErrors((errors) => ({
      ...errors,
      maxTotalVotesError: undefined,
    }));
  };

  const handleVotingMaxPerIdeaChange = (newVotingMaxPerIdeaTotal: string) => {
    const voting_max_votes_per_idea = parseInt(newVotingMaxPerIdeaTotal, 10);
    updateFormData((state) => ({
      ...state,
      voting_max_votes_per_idea,
    }));
    setValidationErrors((errors) => ({
      ...errors,
      maxVotesPerOptionError: undefined,
    }));
  };

  const handleMinVotingOptionsChange = (newMinVotingOptions: string | null) => {
    const voting_min_selected_options = newMinVotingOptions
      ? parseInt(newMinVotingOptions, 10)
      : null;
    updateFormData((state) => ({
      ...state,
      voting_min_selected_options,
    }));
    setValidationErrors((errors) => ({
      ...errors,
      minSelectedOptionsError: undefined,
    }));
  };

  const toggleVotingFilteringEnabled = () => {
    updateFormData((state) => ({
      ...state,
      voting_filtering_enabled: !state.voting_filtering_enabled,
    }));
  };

  const handleInputTermChange = (option: IOption) => {
    const input_term: InputTerm = option.value;

    updateFormData((state) => ({
      ...state,
      input_term,
    }));
  };

  const handleVoteTermChange = (option: IOption) => {
    const voteTerm: VoteTerm = option.value;

    updateFormData((state) => ({
      ...state,
      vote_term: voteTerm,
    }));
  };

  const togglePollAnonymous = () => {
    updateFormData((state) => ({
      ...state,
      poll_anonymous: !state.poll_anonymous,
    }));
  };

  const handleDaysLimitChange = (limit: string) => {
    updateFormData((state) => ({
      ...state,
      expire_days_limit: parseInt(limit, 10),
    }));
  };

  const handleReactingThresholdChange = (threshold: string) => {
    updateFormData((state) => ({
      ...state,
      reacting_threshold: parseInt(threshold, 10),
    }));
  };

  const onPrescreeningModeChange = (
    prescreening_mode: PrescreeningMode | null
  ) => {
    updateFormData((state) => ({
      ...state,
      prescreening_mode,
    }));
  };

  const handleSurveyTitleChange = (surveyTitle: Multiloc) => {
    updateFormData((state) => ({
      ...state,
      native_survey_title_multiloc: surveyTitle,
    }));
  };

  const handleSurveyCTAChange = (CTATitle: Multiloc) => {
    updateFormData((state) => ({
      ...state,
      native_survey_button_multiloc: CTATitle,
    }));
  };

  const handleSimilarityEnabledChange = (value: boolean) => {
    updateFormData((state) => ({
      ...state,
      similarity_enabled: value,
    }));
  };

  const handleThresholdChange = (
    field: 'similarity_threshold_title' | 'similarity_threshold_body',
    value: number
  ) => {
    updateFormData((state) => ({
      ...state,
      [field]: value,
    }));
  };

  const surveyProviders = {
    typeform: typeform_enabled,
    enalyzer: enalyzer_enabled,
    survey_xact: survey_xact_enabled,
    qualtrics: qualtrics_enabled,
    smart_survey: smartsurvey_enabled,
    microsoft_forms: microsoft_forms_enabled,
    survey_monkey: survey_monkey_enabled,
    snap_survey: snap_survey_enabled,
    google_forms: google_forms_enabled,
  };

  const {
    participation_method,
    submission_enabled,
    commenting_enabled,
    autoshare_results_enabled,
    reacting_enabled,
    reacting_like_method,
    reacting_like_limited_max,
    reacting_dislike_enabled,
    reacting_dislike_method,
    reacting_dislike_limited_max,
    allow_anonymous_participation,
    voting_method,
    voting_min_total,
    voting_max_total,
    voting_min_selected_options,
    voting_max_votes_per_idea,
    voting_filtering_enabled,
    survey_service,
    survey_embed_url,
    poll_anonymous,
    presentation_mode,
    ideas_order,
    input_term,
    document_annotation_embed_url,
    expire_days_limit,
    reacting_threshold,
    prescreening_mode,
    similarity_enabled,
    similarity_threshold_title,
    similarity_threshold_body,
    vote_term: voteTerm,
  } = formData;

  const showSurveys =
    surveys_enabled && anyIsDefined(...Object.values(surveyProviders));

  if (!participation_method) {
    // Type check, should in practice always be defined
    return null;
  }

  return (
    <Container>
      <StyledSection>
        <ParticipationMethodPicker
          phase={phase}
          participation_method={participation_method}
          showSurveys={showSurveys}
          apiErrors={apiErrors}
          handleParticipationMethodOnChange={handleParticipationMethodOnChange}
        />
        {project_library_enabled && (
          <Box mb="20px">
            <Warning>
              <FormattedMessage
                {...projectMessages.needInspiration}
                values={{
                  inspirationHubLink: (
                    <Link to="/admin/inspiration-hub" target="_blank">
                      <FormattedMessage {...projectMessages.inspirationHub} />
                    </Link>
                  ),
                }}
              />
            </Warning>
          </Box>
        )}
        {participation_method === 'common_ground' && (
          <UserActions
            submission_enabled={submission_enabled || false}
            commenting_enabled={commenting_enabled || false}
            reacting_enabled={false} // The ability to configure number of likes is irrelevant for common ground
            togglePostingEnabled={togglePostingEnabled}
            toggleCommentingEnabled={toggleCommentingEnabled}
            toggleReactingEnabled={toggleReactingEnabled}
            apiErrors={apiErrors}
            reacting_like_method={reacting_like_method}
            reacting_like_limited_max={reacting_like_limited_max}
            noLikingLimitError={validationErrors.noLikingLimitError}
            handleReactingLikeMethodOnChange={handleReactingLikeMethodOnChange}
            handleLikingLimitOnChange={handleLikingLimitOnChange}
            showCommentingToggle={false}
            showReactingToggle={false}
          />
        )}

        {participation_method === 'voting' && (
          <VotingInputs
            voting_method={voting_method}
            voting_min_total={voting_min_total}
            voting_max_total={voting_max_total}
            voting_min_selected_options={voting_min_selected_options}
            voting_filtering_enabled={voting_filtering_enabled}
            commenting_enabled={commenting_enabled}
            autoshare_results_enabled={autoshare_results_enabled}
            handleMinVotingOptionsChange={handleMinVotingOptionsChange}
            handleVotingMinTotalChange={handleVotingMinTotalChange}
            handleVotingMaxTotalChange={handleVotingMaxTotalChange}
            toggleVotingFilteringEnabled={toggleVotingFilteringEnabled}
            toggleCommentingEnabled={toggleCommentingEnabled}
            toggleAutoshareResultsEnabled={toggleAutoshareResultsEnabled}
            apiErrors={apiErrors}
            validationErrors={validationErrors}
            presentation_mode={presentation_mode}
            handleIdeasDisplayChange={handleIdeasDisplayChange}
            handleVotingMethodOnChange={handleVotingMethodOnChange}
            voting_max_votes_per_idea={voting_max_votes_per_idea}
            handleMaxVotesPerOptionAmountChange={handleVotingMaxPerIdeaChange}
            similarity_enabled={similarity_enabled}
            similarity_threshold_title={similarity_threshold_title}
            similarity_threshold_body={similarity_threshold_body}
            handleSimilarityEnabledChange={handleSimilarityEnabledChange}
            handleThresholdChange={handleThresholdChange}
            handleVoteTermChange={handleVoteTermChange}
            voteTerm={voteTerm}
          />
        )}

        {participation_method === 'ideation' && (
          <IdeationInputs
            input_term={input_term}
            handleInputTermChange={handleInputTermChange}
            submission_enabled={submission_enabled}
            commenting_enabled={commenting_enabled}
            reacting_enabled={reacting_enabled}
            reacting_like_method={reacting_like_method}
            reacting_dislike_method={reacting_dislike_method}
            reacting_like_limited_max={reacting_like_limited_max}
            reacting_dislike_limited_max={reacting_dislike_limited_max}
            reacting_dislike_enabled={reacting_dislike_enabled}
            noLikingLimitError={validationErrors.noLikingLimitError}
            noDislikingLimitError={validationErrors.noDislikingLimitError}
            allow_anonymous_participation={allow_anonymous_participation}
            toggleAnonymousPostingDisabledReason={
              toggleAnonymousPostingDisabledReason
            }
            apiErrors={apiErrors}
            togglePostingEnabled={togglePostingEnabled}
            toggleCommentingEnabled={toggleCommentingEnabled}
            toggleReactingEnabled={toggleReactingEnabled}
            handleReactingLikeMethodOnChange={handleReactingLikeMethodOnChange}
            handleReactingDislikeMethodOnChange={
              handleReactingDislikeMethodOnChange
            }
            handleLikingLimitOnChange={handleLikingLimitOnChange}
            handleDislikingLimitOnChange={handleDislikingLimitOnChange}
            handleReactingDislikeEnabledOnChange={
              handleReactingDislikeEnabledOnChange
            }
            handleAllowAnonymousParticipationOnChange={
              handleAllowAnonymousParticipationOnChange
            }
            presentation_mode={presentation_mode}
            handleIdeasDisplayChange={handleIdeasDisplayChange}
            ideas_order={ideas_order}
            handleIdeaDefaultSortMethodChange={
              handleIdeaDefaultSortMethodChange
            }
            prescreening_mode={prescreening_mode}
            onPrescreeningModeChange={onPrescreeningModeChange}
            similarity_enabled={similarity_enabled}
            similarity_threshold_title={similarity_threshold_title}
            similarity_threshold_body={similarity_threshold_body}
            handleSimilarityEnabledChange={handleSimilarityEnabledChange}
            handleThresholdChange={handleThresholdChange}
          />
        )}

        {participation_method === 'proposals' && (
          <ProposalsInputs
            input_term={input_term}
            handleInputTermChange={handleInputTermChange}
            submission_enabled={submission_enabled}
            commenting_enabled={commenting_enabled}
            reacting_enabled={reacting_enabled}
            reacting_like_method={reacting_like_method}
            reacting_like_limited_max={reacting_like_limited_max}
            noLikingLimitError={validationErrors.noLikingLimitError}
            allow_anonymous_participation={allow_anonymous_participation}
            toggleAnonymousPostingDisabledReason={
              toggleAnonymousPostingDisabledReason
            }
            apiErrors={apiErrors}
            togglePostingEnabled={togglePostingEnabled}
            toggleCommentingEnabled={toggleCommentingEnabled}
            toggleReactingEnabled={toggleReactingEnabled}
            handleReactingLikeMethodOnChange={handleReactingLikeMethodOnChange}
            handleLikingLimitOnChange={handleLikingLimitOnChange}
            handleAllowAnonymousParticipationOnChange={
              handleAllowAnonymousParticipationOnChange
            }
            presentation_mode={presentation_mode}
            handleIdeasDisplayChange={handleIdeasDisplayChange}
            ideas_order={ideas_order}
            handleIdeaDefaultSortMethodChange={
              handleIdeaDefaultSortMethodChange
            }
            expire_days_limit={expire_days_limit}
            handleDaysLimitChange={handleDaysLimitChange}
            reacting_threshold={reacting_threshold}
            expireDateLimitError={validationErrors.expireDateLimitError}
            handleReactingThresholdChange={handleReactingThresholdChange}
            reactingThresholdError={validationErrors.reactingThresholdError}
            prescreening_mode={prescreening_mode}
            onPrescreeningModeChange={onPrescreeningModeChange}
            similarity_enabled={similarity_enabled}
            similarity_threshold_title={similarity_threshold_title}
            similarity_threshold_body={similarity_threshold_body}
            handleSimilarityEnabledChange={handleSimilarityEnabledChange}
            handleThresholdChange={handleThresholdChange}
          />
        )}

        {participation_method === 'poll' && (
          <PollInputs
            poll_anonymous={poll_anonymous}
            apiErrors={apiErrors}
            togglePollAnonymous={togglePollAnonymous}
          />
        )}

        {participation_method === 'document_annotation' && (
          <SectionField>
            <Box display="flex" alignItems="center">
              <Box mr="8px">
                <SubSectionTitle>
                  {formatMessage(messages.konveioDocumentAnnotationEmbedUrl)}
                </SubSectionTitle>
              </Box>
              <IconTooltip
                content={
                  <FormattedMessage
                    {...messages.konveioSupport}
                    values={{
                      supportArticleLink: (
                        <a
                          href={formatMessage(messages.konveioSupportPageURL2)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatMessage(messages.konveioSupportArticle)}
                        </a>
                      ),
                    }}
                  />
                }
              />
            </Box>
            <Input
              onChange={handleDocumentAnnotationEmbedUrlChange}
              type="text"
              value={document_annotation_embed_url}
            />
            <Error
              apiErrors={apiErrors && apiErrors.document_annotation_embed_url}
            />
          </SectionField>
        )}

        {participation_method === 'native_survey' && (
          <NativeSurveyInputs
            apiErrors={apiErrors}
            phase={phase}
            formData={formData}
            handleSurveyTitleChange={handleSurveyTitleChange}
            handleSurveyCTAChange={handleSurveyCTAChange}
          />
        )}
        {participation_method === 'survey' && (
          <SurveyInputs
            survey_service={survey_service}
            survey_embed_url={survey_embed_url}
            apiErrors={apiErrors}
            surveyProviders={surveyProviders}
            handleSurveyProviderChange={handleSurveyProviderChange}
            handleSurveyEmbedUrlChange={handleSurveyEmbedUrlChange}
          />
        )}
      </StyledSection>
    </Container>
  );
};

export default PhaseParticipationConfig;
