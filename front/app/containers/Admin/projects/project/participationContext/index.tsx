import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isEqual } from 'lodash-es';

// components
import ParticipationMethodPicker from './components/ParticipationMethodPicker';
import ParticipatoryBudgetingInputs from './components/ParticipatoryBudgetingInputs';
import PollInputs from './components/PollInputs';
import SurveyInputs from './components/SurveyInputs';
import { Container, StyledSection } from './components/styling';
import IdeationInputs from './components/IdeationInputs';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import {
  Box,
  IconTooltip,
  Input,
  IOption,
} from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import NativeSurveyInputs from './components/NativeSurveyInputs';

// services
import { IProject } from 'api/projects/types';
import { IPhase } from 'api/phases/types';
import {
  ParticipationMethod,
  TSurveyService,
  IdeaDefaultSortMethod,
  getDefaultSortMethodFallback,
  InputTerm,
  INPUT_TERMS,
} from 'services/participationContexts';
import eventEmitter from 'utils/eventEmitter';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps, MessageDescriptor } from 'react-intl';
import messages from '../messages';

// typings
import { CLErrors } from 'typings';
import { adopt } from 'react-adopt';

// utils
import getOutput from './utils/getOutput';
import validate from './utils/validate';
import { anyIsDefined } from 'utils/helperUtils';

export interface IParticipationContextConfig {
  participation_method: ParticipationMethod;
  posting_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  reacting_enabled?: boolean | null;
  reacting_like_method?: 'unlimited' | 'limited' | null;
  reacting_like_limited_max?: number | null;
  reacting_dislike_enabled?: boolean | null;
  allow_anonymous_participation?: boolean | null;
  reacting_dislike_method?: 'unlimited' | 'limited' | null;
  reacting_dislike_limited_max?: number | null;
  presentation_mode?: 'map' | 'card' | null;
  ideas_order?: IdeaDefaultSortMethod;
  input_term?: InputTerm;
  min_budget?: number | null;
  max_budget?: number | null;
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
}

interface Props extends DataProps, InputProps {}

export interface State extends IParticipationContextConfig {
  noLikingLimitError: JSX.Element | null;
  noDislikingLimitError: JSX.Element | null;
  minBudgetError: string | null;
  maxBudgetError: string | null;
  loaded: boolean;
}

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
      reacting_dislike_method: 'unlimited',
      reacting_dislike_limited_max: null,
      presentation_mode: 'card',
      min_budget: null,
      max_budget: null,
      survey_service: null,
      survey_embed_url: null,
      loaded: false,
      noLikingLimitError: null,
      noDislikingLimitError: null,
      minBudgetError: null,
      maxBudgetError: null,
      poll_anonymous: false,
      ideas_order: 'trending',
      input_term: 'idea',
      document_annotation_embed_url: null,
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
          presentation_mode: newData.presentation_mode,
          min_budget: newData.min_budget,
          max_budget: newData.max_budget,
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
    const budgeting = participation_method === 'budgeting';
    const survey = participation_method === 'survey';
    const ideationOrBudgeting = ideation || budgeting;

    this.setState({
      participation_method,
      posting_enabled: ideation ? true : null,
      commenting_enabled: ideationOrBudgeting ? true : null,
      reacting_enabled: ideation ? true : null,
      reacting_like_method: ideation ? 'unlimited' : null,
      reacting_dislike_enabled: ideation ? true : null,
      allow_anonymous_participation: ideationOrBudgeting ? false : null,
      reacting_dislike_method: ideation ? 'unlimited' : null,
      presentation_mode: ideationOrBudgeting ? 'card' : null,
      survey_embed_url: null,
      survey_service: survey ? 'typeform' : null,
      document_annotation_embed_url: null,
      min_budget: budgeting ? 0 : null,
      max_budget: budgeting ? 1000 : null,
      ideas_order: ideationOrBudgeting
        ? getDefaultSortMethodFallback(ideation)
        : null,
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

  handleMaxBudgetingAmountChange = (newMaxBudget: string) => {
    const max_budget = parseInt(newMaxBudget, 10);
    this.setState({
      max_budget,
      maxBudgetError: null,
    });
  };

  handleMinBudgetingAmountChange = (newMinBudget: string) => {
    const min_budget = parseInt(newMinBudget, 10);
    this.setState({
      min_budget,
      minBudgetError: null,
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
      minBudgetError,
      maxBudgetError,
      isValidated,
    } = validate(this.state, formatMessage);

    this.setState({
      noLikingLimitError,
      noDislikingLimitError,
      minBudgetError,
      maxBudgetError,
    });

    return isValidated;
  }

  getInputTermOptions = () => {
    return INPUT_TERMS.map((inputTerm: InputTerm) => {
      const labelMessages: {
        [key in InputTerm]: MessageDescriptor;
      } = {
        idea: messages.ideaTerm,
        contribution: messages.contributionTerm,
        question: messages.questionTerm,
        option: messages.optionTerm,
        issue: messages.issueTerm,
        project: messages.projectTerm,
      };
      const labelMessage = labelMessages[inputTerm];

      return {
        value: inputTerm,
        label: this.props.intl.formatMessage(labelMessage),
      } as IOption;
    });
  };

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
      min_budget,
      max_budget,
      survey_embed_url,
      document_annotation_embed_url,
      survey_service,
      loaded,
      noLikingLimitError,
      noDislikingLimitError,
      minBudgetError,
      maxBudgetError,
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

            {participation_method === 'budgeting' && (
              <ParticipatoryBudgetingInputs
                isCustomInputTermEnabled={isCustomInputTermEnabled}
                input_term={input_term}
                handleInputTermChange={this.handleInputTermChange}
                inputTermOptions={this.getInputTermOptions()}
                allow_anonymous_participation={allow_anonymous_participation}
                min_budget={min_budget}
                max_budget={max_budget}
                commenting_enabled={commenting_enabled}
                minBudgetError={minBudgetError}
                maxBudgetError={maxBudgetError}
                handleMinBudgetingAmountChange={
                  this.handleMinBudgetingAmountChange
                }
                handleMaxBudgetingAmountChange={
                  this.handleMaxBudgetingAmountChange
                }
                toggleCommentingEnabled={this.toggleCommentingEnabled}
                apiErrors={apiErrors}
                presentation_mode={presentation_mode}
                handleIdeasDisplayChange={this.handleIdeasDisplayChange}
                ideas_order={ideas_order}
                handleIdeaDefaultSortMethodChange={
                  this.handleIdeaDefaultSortMethodChange
                }
                handleAllowAnonymousParticipationOnChange={
                  this.handleAllowAnonymousParticipationOnChange
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
                  inputTermOptions={this.getInputTermOptions()}
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
