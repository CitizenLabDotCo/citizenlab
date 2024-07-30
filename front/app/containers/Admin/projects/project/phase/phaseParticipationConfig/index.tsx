import React, { useEffect, useState } from 'react';

import {
  Box,
  IconTooltip,
  Input,
  IOption,
} from '@citizenlab/cl2-component-library';
import { pick } from 'lodash-es';
import { filter } from 'rxjs/operators';
import { CLErrors, Multiloc } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import {
  IdeaDefaultSortMethod,
  InputTerm,
  IPhase,
  ParticipationMethod,
  TSurveyService,
  VotingMethod,
} from 'api/phases/types';
import { IProject } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';
import { anyIsDefined } from 'utils/helperUtils';

import messages from '../../messages';

import IdeationInputs from './components/inputs/IdeationInputs';
import NativeSurveyInputs from './components/inputs/NativeSurveyInputs';
import PollInputs from './components/inputs/PollInputs';
import ProposalsInputs from './components/inputs/ProposalsInputs';
import SurveyInputs from './components/inputs/SurveyInputs';
import VotingInputs from './components/inputs/VotingInputs';
import ParticipationMethodPicker from './components/ParticipationMethodPicker';
import { Container, StyledSection } from './components/shared/styling';
import {
  defaultParticipationConfig,
  ideationDefaultConfig,
  IPhaseParticipationConfig,
  nativeSurveyDefaultConfig,
  proposalsDefaultConfig,
  surveyDefaultConfig,
  votingDefaultConfig,
} from './utils/participationMethodConfigs';
import validatePhaseConfig from './utils/validate';

export type ApiErrors = CLErrors | null | undefined;

interface Props {
  className?: string;
  onChange: (arg: IPhaseParticipationConfig) => void;
  onSubmit: (arg: IPhaseParticipationConfig) => void;
  phase?: IPhase | undefined | null;
  project?: IProject | undefined | null;
  apiErrors: ApiErrors;
}

const MAX_VOTES_PER_VOTING_METHOD: Record<VotingMethod, number> = {
  single_voting: 1,
  multiple_voting: 10,
  budgeting: 100,
};

const PhaseParticipationConfig = ({
  phase,
  onSubmit,
  onChange,
  className,
  apiErrors,
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

  const { data: appConfig } = useAppConfiguration();
  const { formatMessage } = useIntl();
  const [participationConfig, setParticipationConfig] =
    useState<IPhaseParticipationConfig>(
      // Only use the attributes from phase that are relevant to participation config
      phase
        ? (pick(
            phase.data.attributes,
            Object.keys(defaultParticipationConfig)
          ) as IPhaseParticipationConfig)
        : ideationDefaultConfig
    );

  const [noLikingLimitError, setNoLikingLimitError] =
    useState<JSX.Element | null>(null);
  const [noDislikingLimitError, setNoDislikingLimitError] =
    useState<JSX.Element | null>(null);
  const [minTotalVotesError, setMinTotalVotesError] = useState<string | null>(
    null
  );
  const [maxTotalVotesError, setMaxTotalVotesError] = useState<string | null>(
    null
  );
  const [maxVotesPerOptionError, setMaxVotesPerOptionError] = useState<
    string | null
  >(null);
  const [voteTermError, setVoteTermError] = useState<string | null>(null);
  const [expireDateLimitError, setExpireDateLimitError] =
    useState<JSX.Element | null>(null);
  const [reactingThresholdError, setReactingThresholdError] =
    useState<JSX.Element | null>(null);

  useEffect(() => {
    onChange(participationConfig);
  }, [participationConfig, onChange]);

  useEffect(() => {
    const validate = () => {
      const {
        noLikingLimitError,
        noDislikingLimitError,
        minTotalVotesError,
        maxTotalVotesError,
        maxVotesPerOptionError,
        voteTermError,
        expireDateLimitError,
        reactingThresholdError,
        isValidated,
      } = validatePhaseConfig(
        {
          ...participationConfig,
          appConfig,
        },
        formatMessage
      );

      setNoLikingLimitError(noLikingLimitError);
      setNoDislikingLimitError(noDislikingLimitError);
      setMinTotalVotesError(minTotalVotesError);
      setMaxTotalVotesError(maxTotalVotesError);
      setMaxVotesPerOptionError(maxVotesPerOptionError);
      setVoteTermError(voteTermError);
      setExpireDateLimitError(expireDateLimitError);
      setReactingThresholdError(reactingThresholdError);

      return isValidated;
    };

    const subscription = eventEmitter
      .observeEvent('getPhaseParticipationConfig')
      .pipe(filter(() => validate()))
      .subscribe(() => {
        onSubmit(participationConfig);
      });
    return () => subscription.unsubscribe();
  }, [participationConfig, onSubmit, formatMessage, appConfig]);

  const handleParticipationMethodOnChange = (
    participation_method: ParticipationMethod
  ) => {
    const ideation = participation_method === 'ideation';
    const native_survey = participation_method === 'native_survey';
    const voting = participation_method === 'voting';
    const survey = participation_method === 'survey';
    const proposals = participation_method === 'proposals';

    setParticipationConfig(() => ({
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
    setParticipationConfig((state) => ({
      ...state,
      survey_service,
    }));
  };

  const handleSurveyEmbedUrlChange = (survey_embed_url: string) => {
    setParticipationConfig((state) => ({
      ...state,
      survey_embed_url,
    }));
  };

  const handleDocumentAnnotationEmbedUrlChange = (
    document_annotation_embed_url: string
  ) => {
    setParticipationConfig((state) => ({
      ...state,
      document_annotation_embed_url,
    }));
  };

  const togglePostingEnabled = () => {
    setParticipationConfig((state) => ({
      ...state,
      posting_enabled: !state.posting_enabled,
    }));
  };

  const toggleCommentingEnabled = () => {
    setParticipationConfig((state) => ({
      ...state,
      commenting_enabled: !state.commenting_enabled,
    }));
  };

  const toggleReactingEnabled = () => {
    setParticipationConfig((state) => ({
      ...state,
      reacting_enabled: !state.reacting_enabled,
    }));
  };

  const handleReactingLikeMethodOnChange = (
    reacting_like_method: 'unlimited' | 'limited'
  ) => {
    setParticipationConfig((state) => ({
      ...state,
      reacting_like_method,
      reacting_like_limited_max:
        reacting_like_method === 'unlimited' ? null : 5,
    }));
  };

  const handleLikingLimitOnChange = (reacting_like_limited_max: string) => {
    setParticipationConfig((state) => ({
      ...state,
      reacting_like_limited_max: parseInt(reacting_like_limited_max, 10),
    }));
    setNoLikingLimitError(null);
  };

  const handleReactingDislikeEnabledOnChange = (
    reacting_dislike_enabled: boolean
  ) => {
    setParticipationConfig((state) => ({
      ...state,
      reacting_dislike_enabled,
    }));
  };

  const handleAllowAnonymousParticipationOnChange = (
    allow_anonymous_participation: boolean
  ) => {
    setParticipationConfig((state) => ({
      ...state,
      allow_anonymous_participation,
    }));
  };

  const handleVotingMethodOnChange = (voting_method: VotingMethod) => {
    const maxVotes = MAX_VOTES_PER_VOTING_METHOD[voting_method];

    setParticipationConfig((state) => ({
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
    setParticipationConfig((state) => ({
      ...state,
      reacting_dislike_method,
      reacting_dislike_limited_max:
        reacting_dislike_method === 'unlimited' ? null : 5,
    }));
  };

  const handleDislikingLimitOnChange = (
    rreacting_dislike_limited_max: string
  ) => {
    setParticipationConfig((state) => ({
      ...state,
      reacting_dislike_limited_max: parseInt(rreacting_dislike_limited_max, 10),
    }));
    setNoDislikingLimitError(null);
  };

  const handleIdeasDisplayChange = (presentation_mode: 'map' | 'card') => {
    setParticipationConfig((state) => ({
      ...state,
      presentation_mode,
    }));
  };

  const handleIdeaDefaultSortMethodChange = (
    ideas_order: IdeaDefaultSortMethod
  ) => {
    setParticipationConfig((state) => ({
      ...state,
      ideas_order,
    }));
  };

  const handleVotingMinTotalChange = (newVotingMinTotal: string) => {
    const voting_min_total = parseInt(newVotingMinTotal, 10);
    setParticipationConfig((state) => ({
      ...state,
      voting_min_total,
    }));
    setMinTotalVotesError(null);
  };

  const handleVotingMaxTotalChange = (newVotingMaxTotal: string | null) => {
    const voting_max_total = newVotingMaxTotal
      ? parseInt(newVotingMaxTotal, 10)
      : null;
    setParticipationConfig((state) => ({
      ...state,
      voting_max_total,
    }));
    setMaxTotalVotesError(null);
  };

  const handleVotingMaxPerIdeaChange = (newVotingMaxPerIdeaTotal: string) => {
    const voting_max_votes_per_idea = parseInt(newVotingMaxPerIdeaTotal, 10);
    setParticipationConfig((state) => ({
      ...state,
      voting_max_votes_per_idea,
    }));
    setMaxVotesPerOptionError(null);
  };

  const handleVoteTermPluralChange = (
    voting_term_plural_multiloc: Multiloc
  ) => {
    setParticipationConfig((state) => ({
      ...state,
      voting_term_plural_multiloc,
    }));
    setVoteTermError(null);
  };

  const handleVoteTermSingularChange = (
    voting_term_singular_multiloc: Multiloc
  ) => {
    setParticipationConfig((state) => ({
      ...state,
      voting_term_singular_multiloc,
    }));
    setVoteTermError(null);
  };

  const handleInputTermChange = (option: IOption) => {
    const input_term: InputTerm = option.value;

    setParticipationConfig((state) => ({
      ...state,
      input_term,
    }));
  };

  const togglePollAnonymous = () => {
    setParticipationConfig((state) => ({
      ...state,
      poll_anonymous: !state.poll_anonymous,
    }));
  };

  const handleDaysLimitChange = (limit: string) => {
    setParticipationConfig((state) => ({
      ...state,
      expire_days_limit: parseInt(limit, 10),
    }));
  };

  const handleReactingThresholdChange = (threshold: string) => {
    setParticipationConfig((state) => ({
      ...state,
      reacting_threshold: parseInt(threshold, 10),
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
    posting_enabled,
    commenting_enabled,
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
    voting_max_votes_per_idea,
    voting_term_singular_multiloc,
    voting_term_plural_multiloc,
    survey_service,
    survey_embed_url,
    poll_anonymous,
    presentation_mode,
    ideas_order,
    input_term,
    document_annotation_embed_url,
    expire_days_limit,
    reacting_threshold,
  } = participationConfig;

  const showSurveys =
    surveys_enabled && anyIsDefined(...Object.values(surveyProviders));

  return (
    <Container className={className}>
      <StyledSection>
        <ParticipationMethodPicker
          phase={phase}
          participation_method={participation_method}
          showSurveys={showSurveys}
          apiErrors={apiErrors}
          handleParticipationMethodOnChange={handleParticipationMethodOnChange}
        />

        {participation_method === 'voting' && (
          <VotingInputs
            voting_method={voting_method}
            voting_min_total={voting_min_total}
            voting_max_total={voting_max_total}
            commenting_enabled={commenting_enabled}
            minTotalVotesError={minTotalVotesError}
            maxTotalVotesError={maxTotalVotesError}
            voteTermError={voteTermError}
            maxVotesPerOptionError={maxVotesPerOptionError}
            handleVotingMinTotalChange={handleVotingMinTotalChange}
            handleVotingMaxTotalChange={handleVotingMaxTotalChange}
            handleVoteTermPluralChange={handleVoteTermPluralChange}
            handleVoteTermSingularChange={handleVoteTermSingularChange}
            toggleCommentingEnabled={toggleCommentingEnabled}
            apiErrors={apiErrors}
            presentation_mode={presentation_mode}
            handleIdeasDisplayChange={handleIdeasDisplayChange}
            handleVotingMethodOnChange={handleVotingMethodOnChange}
            voting_max_votes_per_idea={voting_max_votes_per_idea}
            voting_term_plural_multiloc={voting_term_plural_multiloc}
            voting_term_singular_multiloc={voting_term_singular_multiloc}
            handleMaxVotesPerOptionAmountChange={handleVotingMaxPerIdeaChange}
          />
        )}

        {participation_method === 'ideation' && (
          <IdeationInputs
            input_term={input_term}
            handleInputTermChange={handleInputTermChange}
            posting_enabled={posting_enabled}
            commenting_enabled={commenting_enabled}
            reacting_enabled={reacting_enabled}
            reacting_like_method={reacting_like_method}
            reacting_dislike_method={reacting_dislike_method}
            reacting_like_limited_max={reacting_like_limited_max}
            reacting_dislike_limited_max={reacting_dislike_limited_max}
            reacting_dislike_enabled={reacting_dislike_enabled}
            noLikingLimitError={noLikingLimitError}
            noDislikingLimitError={noDislikingLimitError}
            allow_anonymous_participation={allow_anonymous_participation}
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
          />
        )}

        {participation_method === 'proposals' && (
          <ProposalsInputs
            input_term={input_term}
            handleInputTermChange={handleInputTermChange}
            posting_enabled={posting_enabled}
            commenting_enabled={commenting_enabled}
            reacting_enabled={reacting_enabled}
            reacting_like_method={reacting_like_method}
            reacting_like_limited_max={reacting_like_limited_max}
            noLikingLimitError={noLikingLimitError}
            allow_anonymous_participation={allow_anonymous_participation}
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
            expireDateLimitError={expireDateLimitError}
            handleReactingThresholdChange={handleReactingThresholdChange}
            reactingThresholdError={reactingThresholdError}
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
                          href={formatMessage(messages.konveioSupportPageURL)}
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
            allow_anonymous_participation={allow_anonymous_participation}
            handleAllowAnonymousParticipationOnChange={
              handleAllowAnonymousParticipationOnChange
            }
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
