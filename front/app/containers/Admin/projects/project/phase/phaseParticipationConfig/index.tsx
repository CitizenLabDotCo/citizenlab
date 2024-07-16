import React, { useEffect, useState } from 'react';

import {
  Box,
  IconTooltip,
  Input,
  IOption,
} from '@citizenlab/cl2-component-library';
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
import SurveyInputs from './components/inputs/SurveyInputs';
import VotingInputs from './components/inputs/VotingInputs';
import ParticipationMethodPicker from './components/ParticipationMethodPicker';
import { Container, StyledSection } from './components/shared/styling';
import getOutput from './utils/getOutput';
import validatePhaseConfig from './utils/validate';

export interface IPhaseParticipationConfig {
  participation_method: ParticipationMethod;
  posting_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  reacting_enabled?: boolean | null;
  reacting_like_method?: 'unlimited' | 'limited' | null;
  reacting_like_limited_max?: number | null;
  reacting_dislike_enabled?: boolean | null;
  allow_anonymous_participation?: boolean | null;
  voting_method?: VotingMethod | null;
  reacting_dislike_method?: 'unlimited' | 'limited' | null;
  reacting_dislike_limited_max?: number | null;
  presentation_mode?: 'map' | 'card' | null;
  ideas_order?: IdeaDefaultSortMethod;
  input_term?: InputTerm;
  voting_min_total?: number | null;
  voting_max_total?: number | null;
  voting_max_votes_per_idea?: number | null;
  voting_term_singular_multiloc?: Multiloc | null;
  voting_term_plural_multiloc?: Multiloc | null;
  survey_service?: TSurveyService | null;
  survey_embed_url?: string | null;
  poll_anonymous?: boolean;
  document_annotation_embed_url?: string | null;
}

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
    useState<IPhaseParticipationConfig>({
      participation_method:
        phase?.data.attributes.participation_method || 'ideation',
      posting_enabled: phase?.data.attributes.posting_enabled ?? true,
      commenting_enabled: phase?.data.attributes.commenting_enabled ?? true,
      reacting_enabled: phase?.data.attributes.reacting_enabled ?? true,
      reacting_like_method:
        phase?.data.attributes.reacting_like_method || 'unlimited',
      reacting_like_limited_max:
        phase?.data.attributes.reacting_like_limited_max || null,
      reacting_dislike_enabled:
        phase?.data.attributes.reacting_dislike_enabled ?? true,
      reacting_dislike_method:
        phase?.data.attributes.reacting_dislike_method || 'unlimited',
      reacting_dislike_limited_max:
        phase?.data.attributes.reacting_dislike_limited_max || null,
      allow_anonymous_participation:
        phase?.data.attributes.allow_anonymous_participation || false,
      voting_method: phase?.data.attributes.voting_method || 'single_voting',
      voting_min_total: phase?.data.attributes.voting_min_total || null,
      voting_max_total: phase?.data.attributes.voting_max_total || null,
      survey_service: phase?.data.attributes.survey_service || null,
      survey_embed_url: phase?.data.attributes.survey_embed_url || null,
      voting_max_votes_per_idea:
        phase?.data.attributes.voting_max_votes_per_idea || null,
      poll_anonymous: phase?.data.attributes.poll_anonymous || false,
      presentation_mode: phase?.data.attributes.presentation_mode || 'card',
      ideas_order: phase?.data.attributes.ideas_order || 'trending',
      input_term: phase?.data.attributes.input_term || 'idea',
      document_annotation_embed_url:
        phase?.data.attributes.document_annotation_embed_url || null,
      voting_term_singular_multiloc:
        phase?.data.attributes.voting_term_singular_multiloc || null,
      voting_term_plural_multiloc:
        phase?.data.attributes.voting_term_plural_multiloc || null,
    });

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

      return isValidated;
    };

    const subscription = eventEmitter
      .observeEvent('getPhaseParticipationConfig')
      .pipe(filter(() => validate()))
      .subscribe(() => {
        const output = getOutput(participationConfig);
        onSubmit(output);
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

    const ideationDefaultConfig: IPhaseParticipationConfig = {
      participation_method,
      posting_enabled: true,
      commenting_enabled: true,
      reacting_enabled: true,
      reacting_like_method: 'unlimited',
      reacting_dislike_enabled: true,
      reacting_dislike_method: 'unlimited',
      allow_anonymous_participation: false,
      presentation_mode: 'card',
      ideas_order: 'trending',
    };

    const votingDefaultConfig: IPhaseParticipationConfig = {
      participation_method,
      voting_method: 'single_voting',
      voting_min_total: 0,
      voting_max_total: 100,
      voting_max_votes_per_idea: 1,
      voting_term_singular_multiloc: {
        en: 'vote',
      },
      voting_term_plural_multiloc: {
        en: 'votes',
      },
    };

    const surveyDefaultConfig: IPhaseParticipationConfig = {
      participation_method,
      survey_service: 'typeform',
    };

    const nativeSurveyDefaultConfig: IPhaseParticipationConfig = {
      participation_method,
      allow_anonymous_participation: false,
      posting_enabled: true,
      reacting_enabled: true,
      reacting_like_method: 'unlimited',
      reacting_dislike_enabled: true,
      reacting_dislike_method: 'unlimited',
    };

    const commonConfig: IPhaseParticipationConfig = {
      participation_method,
    };

    setParticipationConfig(() => ({
      ...(ideation ? ideationDefaultConfig : {}),
      ...(voting ? votingDefaultConfig : {}),
      ...(survey ? surveyDefaultConfig : {}),
      ...(native_survey ? nativeSurveyDefaultConfig : {}),
      ...commonConfig,
    }));
  };

  console.log(participationConfig);

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

        {participation_method === 'ideation' &&
          input_term &&
          typeof reacting_enabled === 'boolean' &&
          typeof posting_enabled === 'boolean' &&
          typeof commenting_enabled === 'boolean' && (
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
              handleReactingLikeMethodOnChange={
                handleReactingLikeMethodOnChange
              }
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

        {participation_method === 'poll' && (
          <PollInputs
            poll_anonymous={poll_anonymous}
            apiErrors={apiErrors}
            togglePollAnonymous={togglePollAnonymous}
          />
        )}

        {participation_method === 'document_annotation' && (
          <SectionField>
            <Box display="flex">
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
