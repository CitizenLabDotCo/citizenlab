import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import { adopt } from 'react-adopt';

// components
import ParticipationMethodPicker from './components/ParticipationMethodPicker';
import VotingInputs from './components/inputs/VotingInputs';
import PollInputs from './components/inputs/PollInputs';
import SurveyInputs from './components/inputs/SurveyInputs';
import NativeSurveyInputs from './components/inputs/NativeSurveyInputs';
import IdeationInputs from './components/inputs/IdeationInputs';
import { Container, StyledSection } from './components/shared/styling';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import {
  Box,
  IconTooltip,
  Input,
  IOption,
} from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';

// services
import { IProject } from 'api/projects/types';
import { IPhase } from 'api/phases/types';
import {
  ParticipationMethod,
  TSurveyService,
  IdeaDefaultSortMethod,
  getDefaultSortMethodFallback,
  InputTerm,
  VotingMethod,
} from 'utils/participationContexts';
import eventEmitter from 'utils/eventEmitter';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';

// utils
import getOutput from './utils/getOutput';
import validate from './utils/validate';
import { anyIsDefined } from 'utils/helperUtils';

// typings
import { CLErrors, Multiloc } from 'typings';
import { IAppConfiguration } from 'api/app_configuration/types';

export interface IParticipationContextConfig {
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

interface DataProps {
  surveys_enabled: GetFeatureFlagChildProps;
  typeform_enabled: GetFeatureFlagChildProps;
  google_forms_enabled: GetFeatureFlagChildProps;
  enalyzer_enabled: GetFeatureFlagChildProps;
  survey_xact_enabled: GetFeatureFlagChildProps;
  qualtrics_enabled: GetFeatureFlagChildProps;
  smartsurvey_enabled: GetFeatureFlagChildProps;
  microsoft_forms_enabled: GetFeatureFlagChildProps;
  survey_monkey_enabled: GetFeatureFlagChildProps;
  snap_survey_enabled: GetFeatureFlagChildProps;
  isCustomInputTermEnabled: GetFeatureFlagChildProps;
}

export type ApiErrors = CLErrors | null | undefined;

interface InputProps {
  className?: string;
  onChange: (arg: IParticipationContextConfig) => void;
  onSubmit: (arg: IParticipationContextConfig) => void;
  phase?: IPhase | undefined | null;
  project?: IProject | undefined | null;
  apiErrors: ApiErrors;
  appConfig?: IAppConfiguration;
}

interface Props extends DataProps, InputProps {}

export interface State extends IParticipationContextConfig {
  noLikingLimitError: JSX.Element | null;
  noDislikingLimitError: JSX.Element | null;
  minTotalVotesError: string | null;
  maxTotalVotesError: string | null;
  maxVotesPerOptionError: string | null;
  voteTermError: string | null;
  loaded: boolean;
  appConfig: IAppConfiguration | null;
}

const MAX_VOTES_PER_VOTING_METHOD: Record<VotingMethod, number> = {
  single_voting: 1,
  multiple_voting: 10,
  budgeting: 100,
};

class ParticipationContext extends PureComponent<
  Props & WrappedComponentProps,
  State
> {
  subscriptions: Subscription[];

  constructor(props: Props & WrappedComponentProps) {
    super(props);

    this.state = {
      participation_method: 'ideation',
      posting_enabled: true,
      commenting_enabled: true,
      reacting_enabled: true,
      reacting_like_method: 'unlimited',
      reacting_like_limited_max: null,
      reacting_dislike_enabled: true,
      allow_anonymous_participation: false,
      voting_method: null,
      reacting_dislike_method: 'unlimited',
      reacting_dislike_limited_max: null,
      presentation_mode: 'card',
      voting_min_total: null,
      voting_max_total: null,
      survey_service: null,
      survey_embed_url: null,
      voting_max_votes_per_idea: null,
      loaded: false,
      noLikingLimitError: null,
      noDislikingLimitError: null,
      minTotalVotesError: null,
      maxTotalVotesError: null,
      maxVotesPerOptionError: null,
      voting_term_plural_multiloc: null,
      voting_term_singular_multiloc: null,
      voteTermError: null,
      poll_anonymous: false,
      ideas_order: 'trending',
      input_term: 'idea',
      document_annotation_embed_url: null,
      appConfig: props.appConfig || null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { project, phase } = this.props;
    const participationContext = project ?? phase;

    if (participationContext && participationContext.data) {
      const newData = participationContext.data.attributes;

      this.setState((prevState) => {
        return {
          ...prevState,
          participation_method: newData.participation_method,
          posting_enabled: newData.posting_enabled,
          commenting_enabled: newData.commenting_enabled,
          reacting_enabled: newData.reacting_enabled,
          reacting_like_method: newData.reacting_like_method,
          reacting_dislike_method: newData.reacting_dislike_method,
          reacting_like_limited_max: newData.reacting_like_limited_max,
          reacting_dislike_limited_max: newData.reacting_dislike_limited_max,
          reacting_dislike_enabled: newData.reacting_dislike_enabled,
          allow_anonymous_participation: newData.allow_anonymous_participation,
          voting_method: newData.voting_method,
          presentation_mode: newData.presentation_mode,
          voting_min_total: newData.voting_min_total,
          voting_max_total: newData.voting_max_total,
          voting_max_votes_per_idea: newData.voting_max_votes_per_idea,
          voting_term_plural_multiloc: newData.voting_term_plural_multiloc,
          voting_term_singular_multiloc: newData.voting_term_singular_multiloc,
          survey_embed_url: newData.survey_embed_url,
          survey_service: newData.survey_service,
          poll_anonymous: newData.poll_anonymous,
          ideas_order: newData.ideas_order,
          input_term: newData.input_term,
          document_annotation_embed_url: newData.document_annotation_embed_url,
          loaded: true,
        };
      });
    } else {
      this.setState({ loaded: true });
    }

    this.subscriptions = [
      eventEmitter
        .observeEvent('getParticipationContext')
        .pipe(filter(() => this.validate()))
        .subscribe(() => {
          const output = getOutput(this.state);
          this.props.onSubmit(output);
        }),
    ];
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    const {
      noLikingLimitError: _prevNoLikingLimit,
      noDislikingLimitError: _prevNoDislikingLimit,
      loaded: _prevLoaded,
      ...prevPartialState
    } = prevState;
    const {
      noLikingLimitError: _nextNoLikingLimit,
      noDislikingLimitError: _nextNoDislikingLimit,
      loaded: _nextLoaded,
      ...nextPartialState
    } = this.state;

    if (!isEqual(prevPartialState, nextPartialState)) {
      const output = getOutput(this.state);
      this.props.onChange(output);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  handleParticipationMethodOnChange = (
    participation_method: ParticipationMethod
  ) => {
    const ideation = participation_method === 'ideation';
    const voting = participation_method === 'voting';
    const survey = participation_method === 'survey';
    const ideationOrVoting = ideation || voting;

    this.setState({
      participation_method,
      posting_enabled: ideation ? true : null,
      commenting_enabled: ideationOrVoting ? true : null,
      reacting_enabled: ideation ? true : null,
      reacting_like_method: ideation ? 'unlimited' : null,
      reacting_dislike_enabled: ideation ? true : null,
      reacting_dislike_method: ideation ? 'unlimited' : null,
      allow_anonymous_participation: ideation ? false : null,
      voting_method: voting ? 'single_voting' : null,
      presentation_mode: ideationOrVoting ? 'card' : null,
      survey_embed_url: null,
      survey_service: survey ? 'typeform' : null,
      document_annotation_embed_url: null,
      voting_min_total: voting ? 0 : null,
      voting_max_total: voting ? 100 : null,
      voting_max_votes_per_idea: voting ? 1 : null,
      ideas_order: ideation ? getDefaultSortMethodFallback(ideation) : null,
    });
  };

  handleSurveyProviderChange = (survey_service: TSurveyService) => {
    this.setState({ survey_service });
  };

  handleSurveyEmbedUrlChange = (survey_embed_url: string) => {
    this.setState({ survey_embed_url });
  };

  handleDocumentAnnotationEmbedUrlChange = (
    document_annotation_embed_url: string
  ) => {
    this.setState({ document_annotation_embed_url });
  };

  togglePostingEnabled = () => {
    this.setState((state) => ({ posting_enabled: !state.posting_enabled }));
  };

  toggleCommentingEnabled = () => {
    this.setState((state) => ({
      commenting_enabled: !state.commenting_enabled,
    }));
  };

  toggleReactingEnabled = () => {
    this.setState((state) => ({ reacting_enabled: !state.reacting_enabled }));
  };

  handleReactingLikeMethodOnChange = (
    reacting_like_method: 'unlimited' | 'limited'
  ) => {
    this.setState({
      reacting_like_method,
      reacting_like_limited_max:
        reacting_like_method === 'unlimited' ? null : 5,
    });
  };

  handleLikingLimitOnChange = (reacting_like_limited_max: string) => {
    this.setState({
      reacting_like_limited_max: parseInt(reacting_like_limited_max, 10),
      noLikingLimitError: null,
    });
  };

  handleReactingDislikeEnabledOnChange = (
    reacting_dislike_enabled: boolean
  ) => {
    this.setState({ reacting_dislike_enabled });
  };

  handleAllowAnonymousParticipationOnChange = (
    allow_anonymous_participation: boolean
  ) => {
    this.setState({ allow_anonymous_participation });
  };

  handleVotingMethodOnChange = (voting_method: VotingMethod) => {
    const maxVotes = MAX_VOTES_PER_VOTING_METHOD[voting_method];

    this.setState({
      voting_method,
      voting_max_votes_per_idea:
        voting_method === 'single_voting'
          ? 1
          : this.state.voting_max_votes_per_idea,
      voting_max_total: maxVotes,
    });
  };

  handleReactingDislikeMethodOnChange = (
    reacting_dislike_method: 'unlimited' | 'limited'
  ) => {
    this.setState({
      reacting_dislike_method,
      reacting_dislike_limited_max:
        reacting_dislike_method === 'unlimited' ? null : 5,
    });
  };

  handleDislikingLimitOnChange = (reacting_dislike_limited_max: string) => {
    this.setState({
      reacting_dislike_limited_max: parseInt(reacting_dislike_limited_max, 10),
      noDislikingLimitError: null,
    });
  };

  handleIdeasDisplayChange = (presentation_mode: 'map' | 'card') => {
    this.setState({ presentation_mode });
  };

  handleIdeaDefaultSortMethodChange = (ideas_order: IdeaDefaultSortMethod) => {
    this.setState({ ideas_order });
  };

  handleVotingMinTotalChange = (newVotingMinTotal: string) => {
    const voting_min_total = parseInt(newVotingMinTotal, 10);
    this.setState({
      voting_min_total,
      minTotalVotesError: null,
    });
  };

  handleVotingMaxTotalChange = (newVotingMaxTotal: string | null) => {
    const voting_max_total = newVotingMaxTotal
      ? parseInt(newVotingMaxTotal, 10)
      : null;
    this.setState({
      voting_max_total,
      maxTotalVotesError: null,
    });
  };

  handleVotingMaxPerIdeaChange = (newVotingMaxPerIdeaTotal: string) => {
    const voting_max_votes_per_idea = parseInt(newVotingMaxPerIdeaTotal, 10);
    this.setState({
      voting_max_votes_per_idea,
      maxVotesPerOptionError: null,
    });
  };

  handleVoteTermPluralChange = (voting_term_plural_multiloc: Multiloc) => {
    this.setState({
      voting_term_plural_multiloc,
      voteTermError: null,
    });
  };

  handleVoteTermSingularChange = (voting_term_singular_multiloc: Multiloc) => {
    this.setState({
      voting_term_singular_multiloc,
      voteTermError: null,
    });
  };

  handleInputTermChange = (option: IOption) => {
    const input_term: InputTerm = option.value;

    this.setState({
      input_term,
    });
  };

  togglePollAnonymous = () => {
    this.setState((state) => ({ poll_anonymous: !state.poll_anonymous }));
  };

  validate() {
    const {
      intl: { formatMessage },
    } = this.props;

    const {
      noLikingLimitError,
      noDislikingLimitError,
      minTotalVotesError,
      maxTotalVotesError,
      maxVotesPerOptionError,
      voteTermError,
      isValidated,
    } = validate(this.state, formatMessage);

    this.setState({
      noLikingLimitError,
      noDislikingLimitError,
      minTotalVotesError,
      maxTotalVotesError,
      maxVotesPerOptionError,
      voteTermError,
    });

    return isValidated;
  }

  render() {
    const {
      className,
      apiErrors,
      surveys_enabled,
      typeform_enabled,
      enalyzer_enabled,
      survey_xact_enabled,
      qualtrics_enabled,
      smartsurvey_enabled,
      microsoft_forms_enabled,
      survey_monkey_enabled,
      snap_survey_enabled,
      google_forms_enabled,
      isCustomInputTermEnabled,
      intl: { formatMessage },
    } = this.props;

    const {
      participation_method,
      posting_enabled,
      commenting_enabled,
      reacting_enabled,
      reacting_like_method,
      reacting_dislike_method,
      reacting_like_limited_max,
      reacting_dislike_limited_max,
      reacting_dislike_enabled,
      allow_anonymous_participation,
      voting_term_plural_multiloc,
      voting_term_singular_multiloc,
      voting_method,
      voting_min_total,
      voting_max_total,
      voting_max_votes_per_idea,
      survey_embed_url,
      document_annotation_embed_url,
      survey_service,
      loaded,
      noLikingLimitError,
      noDislikingLimitError,
      minTotalVotesError,
      maxTotalVotesError,
      maxVotesPerOptionError,
      voteTermError,
      poll_anonymous,
      presentation_mode,
      ideas_order,
      input_term,
    } = this.state;

    if (loaded) {
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

      const showSurveys =
        surveys_enabled && anyIsDefined(...Object.values(surveyProviders));

      return (
        <Container className={className}>
          <StyledSection>
            <ParticipationMethodPicker
              phase={this.props.phase}
              project={this.props.project?.data}
              participation_method={participation_method}
              showSurveys={showSurveys}
              apiErrors={apiErrors}
              handleParticipationMethodOnChange={
                this.handleParticipationMethodOnChange
              }
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
                handleVotingMinTotalChange={this.handleVotingMinTotalChange}
                handleVotingMaxTotalChange={this.handleVotingMaxTotalChange}
                handleVoteTermPluralChange={this.handleVoteTermPluralChange}
                handleVoteTermSingularChange={this.handleVoteTermSingularChange}
                toggleCommentingEnabled={this.toggleCommentingEnabled}
                apiErrors={apiErrors}
                presentation_mode={presentation_mode}
                handleIdeasDisplayChange={this.handleIdeasDisplayChange}
                handleVotingMethodOnChange={this.handleVotingMethodOnChange}
                voting_max_votes_per_idea={voting_max_votes_per_idea}
                voting_term_plural_multiloc={voting_term_plural_multiloc}
                voting_term_singular_multiloc={voting_term_singular_multiloc}
                handleMaxVotesPerOptionAmountChange={
                  this.handleVotingMaxPerIdeaChange
                }
              />
            )}

            {participation_method === 'ideation' &&
              input_term &&
              typeof reacting_enabled === 'boolean' &&
              typeof posting_enabled === 'boolean' &&
              typeof commenting_enabled === 'boolean' && (
                <IdeationInputs
                  isCustomInputTermEnabled={isCustomInputTermEnabled}
                  input_term={input_term}
                  handleInputTermChange={this.handleInputTermChange}
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
                  togglePostingEnabled={this.togglePostingEnabled}
                  toggleCommentingEnabled={this.toggleCommentingEnabled}
                  toggleReactingEnabled={this.toggleReactingEnabled}
                  handleReactingLikeMethodOnChange={
                    this.handleReactingLikeMethodOnChange
                  }
                  handleReactingDislikeMethodOnChange={
                    this.handleReactingDislikeMethodOnChange
                  }
                  handleLikingLimitOnChange={this.handleLikingLimitOnChange}
                  handleDislikingLimitOnChange={
                    this.handleDislikingLimitOnChange
                  }
                  handleReactingDislikeEnabledOnChange={
                    this.handleReactingDislikeEnabledOnChange
                  }
                  handleAllowAnonymousParticipationOnChange={
                    this.handleAllowAnonymousParticipationOnChange
                  }
                  presentation_mode={presentation_mode}
                  handleIdeasDisplayChange={this.handleIdeasDisplayChange}
                  ideas_order={ideas_order}
                  handleIdeaDefaultSortMethodChange={
                    this.handleIdeaDefaultSortMethodChange
                  }
                />
              )}

            {participation_method === 'poll' && (
              <PollInputs
                poll_anonymous={poll_anonymous}
                apiErrors={apiErrors}
                togglePollAnonymous={this.togglePollAnonymous}
              />
            )}

            {participation_method === 'document_annotation' && (
              <SectionField>
                <Box display="flex">
                  <Box mr="8px">
                    <SubSectionTitle>
                      {formatMessage(
                        messages.konveioDocumentAnnotationEmbedUrl
                      )}
                    </SubSectionTitle>
                  </Box>
                  <IconTooltip
                    content={
                      <FormattedMessage
                        {...messages.konveioSupport}
                        values={{
                          supportArticleLink: (
                            <a
                              href={formatMessage(
                                messages.konveioSupportPageURL
                              )}
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
                  onChange={this.handleDocumentAnnotationEmbedUrlChange}
                  type="text"
                  value={document_annotation_embed_url}
                />
                <Error
                  apiErrors={
                    apiErrors && apiErrors.document_annotation_embed_url
                  }
                />
              </SectionField>
            )}

            {participation_method === 'native_survey' && (
              <NativeSurveyInputs
                allow_anonymous_participation={allow_anonymous_participation}
                handleAllowAnonymousParticipationOnChange={
                  this.handleAllowAnonymousParticipationOnChange
                }
              />
            )}
            {participation_method === 'survey' && (
              <SurveyInputs
                survey_service={survey_service}
                survey_embed_url={survey_embed_url}
                apiErrors={apiErrors}
                surveyProviders={surveyProviders}
                handleSurveyProviderChange={this.handleSurveyProviderChange}
                handleSurveyEmbedUrlChange={this.handleSurveyEmbedUrlChange}
              />
            )}
          </StyledSection>
        </Container>
      );
    }
    return null;
  }
}

const Data = adopt<DataProps>({
  surveys_enabled: <GetFeatureFlag name="surveys" />,
  typeform_enabled: <GetFeatureFlag name="typeform_surveys" />,
  google_forms_enabled: <GetFeatureFlag name="google_forms_surveys" />,
  survey_monkey_enabled: <GetFeatureFlag name="surveymonkey_surveys" />,
  enalyzer_enabled: <GetFeatureFlag name="enalyzer_surveys" />,
  survey_xact_enabled: <GetFeatureFlag name="survey_xact_surveys" />,
  qualtrics_enabled: <GetFeatureFlag name="qualtrics_surveys" />,
  smartsurvey_enabled: <GetFeatureFlag name="smart_survey_surveys" />,
  snap_survey_enabled: <GetFeatureFlag name="snap_survey_surveys" />,
  microsoft_forms_enabled: <GetFeatureFlag name="microsoft_forms_surveys" />,
  isCustomInputTermEnabled: <GetFeatureFlag name="idea_custom_copy" />,
});

const ParticipationContextWithIntl = injectIntl(ParticipationContext);

export default (inputProps: InputProps) => (
  <Data>
    {(dataProps: DataProps) => (
      <ParticipationContextWithIntl {...inputProps} {...dataProps} />
    )}
  </Data>
);
