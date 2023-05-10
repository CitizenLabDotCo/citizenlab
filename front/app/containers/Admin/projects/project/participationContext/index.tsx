import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isEqual } from 'lodash-es';

// components
import { ParticipationMethodPicker } from './components/ParticipationMethodPicker';
import ParticipatoryBudgetingInputs from './components/ParticipatoryBudgetingInputs';
import PollInputs from './components/PollInputs';
import SurveyInputs from './components/SurveyInputs';
import { Container, StyledSection } from './components/styling';

// services
import { IProject } from 'api/projects/types';
import { IPhase } from 'services/phases';
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
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps, MessageDescriptor } from 'react-intl';
import messages from '../messages';

// typings
import { CLErrors } from 'typings';
import { adopt } from 'react-adopt';
import { IOption } from '@citizenlab/cl2-component-library';

// utils
import getOutput from './utils/getOutput';
import validate from './utils/validate';
import { anyIsDefined } from 'utils/helperUtils';
import IdeationInputs from './components/IdeationInputs';

export interface IParticipationContextConfig {
  participation_method: ParticipationMethod;
  posting_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  voting_enabled?: boolean | null;
  upvoting_method?: 'unlimited' | 'limited' | null;
  upvoting_limited_max?: number | null;
  downvoting_enabled?: boolean | null;
  downvoting_method?: 'unlimited' | 'limited' | null;
  downvoting_limited_max?: number | null;
  presentation_mode?: 'map' | 'card' | null;
  ideas_order?: IdeaDefaultSortMethod;
  input_term?: InputTerm;
  min_budget?: number | null;
  max_budget?: number | null;
  survey_service?: TSurveyService | null;
  survey_embed_url?: string | null;
  poll_anonymous?: boolean;
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
  konveio_enabled: GetFeatureFlagChildProps;
  isCustomInputTermEnabled: GetFeatureFlagChildProps;
}

export type ApiErrors = CLErrors | null | undefined;

interface InputProps {
  onChange: (arg: IParticipationContextConfig) => void;
  onSubmit: (arg: IParticipationContextConfig) => void;
  phase?: IPhase | undefined | null;
  project?: IProject | undefined | null;
  apiErrors: ApiErrors;
}

interface Props extends DataProps, InputProps {}

export interface State extends IParticipationContextConfig {
  noUpvotingLimitError: JSX.Element | null;
  noDownvotingLimitError: JSX.Element | null;
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
      voting_enabled: true,
      upvoting_method: 'unlimited',
      upvoting_limited_max: null,
      downvoting_enabled: true,
      downvoting_method: 'unlimited',
      downvoting_limited_max: null,
      presentation_mode: 'card',
      min_budget: null,
      max_budget: null,
      survey_service: null,
      survey_embed_url: null,
      loaded: false,
      noUpvotingLimitError: null,
      noDownvotingLimitError: null,
      minBudgetError: null,
      maxBudgetError: null,
      poll_anonymous: false,
      ideas_order: 'trending',
      input_term: 'idea',
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { project, phase } = this.props;
    const participationContext = project ?? phase;

    if (participationContext) {
      const newData = participationContext.data.attributes;
      this.setState((prevState) => {
        return {
          ...prevState,
          participation_method: newData.participation_method,
          posting_enabled: newData.posting_enabled,
          commenting_enabled: newData.commenting_enabled,
          voting_enabled: newData.voting_enabled,
          upvoting_method: newData.upvoting_method,
          downvoting_method: newData.downvoting_method,
          upvoting_limited_max: newData.upvoting_limited_max,
          downvoting_limited_max: newData.downvoting_limited_max,
          downvoting_enabled: newData.downvoting_enabled,
          presentation_mode: newData.presentation_mode,
          min_budget: newData.min_budget,
          max_budget: newData.max_budget,
          survey_embed_url: newData.survey_embed_url,
          survey_service: newData.survey_service,
          poll_anonymous: newData.poll_anonymous,
          ideas_order: newData.ideas_order,
          input_term: newData.input_term,
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
      noUpvotingLimitError: _prevNoUpvotingLimit,
      noDownvotingLimitError: _prevNoDownvotingLimit,
      loaded: _prevLoaded,
      ...prevPartialState
    } = prevState;
    const {
      noUpvotingLimitError: _nextNoUpvotingLimit,
      noDownvotingLimitError: _nextNoDownvotingLimit,
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
      voting_enabled: ideation ? true : null,
      upvoting_method: ideation ? 'unlimited' : null,
      downvoting_enabled: ideation ? true : null,
      downvoting_method: ideation ? 'unlimited' : null,
      presentation_mode: ideationOrBudgeting ? 'card' : null,
      survey_embed_url: null,
      survey_service: survey ? 'typeform' : null,
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

  togglePostingEnabled = () => {
    this.setState((state) => ({ posting_enabled: !state.posting_enabled }));
  };

  toggleCommentingEnabled = () => {
    this.setState((state) => ({
      commenting_enabled: !state.commenting_enabled,
    }));
  };

  toggleVotingEnabled = () => {
    this.setState((state) => ({ voting_enabled: !state.voting_enabled }));
  };

  handleUpvotingMethodOnChange = (upvoting_method: 'unlimited' | 'limited') => {
    this.setState({
      upvoting_method,
      upvoting_limited_max: upvoting_method === 'unlimited' ? null : 5,
    });
  };

  handleUpvotingLimitOnChange = (upvoting_limited_max: string) => {
    this.setState({
      upvoting_limited_max: parseInt(upvoting_limited_max, 10),
      noUpvotingLimitError: null,
    });
  };

  handleDownvotingEnabledOnChange = (downvoting_enabled: boolean) => {
    this.setState({ downvoting_enabled });
  };

  handleDownvotingMethodOnChange = (
    downvoting_method: 'unlimited' | 'limited'
  ) => {
    this.setState({
      downvoting_method,
      downvoting_limited_max: downvoting_method === 'unlimited' ? null : 5,
    });
  };

  handleDownvotingLimitOnChange = (downvoting_limited_max: string) => {
    this.setState({
      downvoting_limited_max: parseInt(downvoting_limited_max, 10),
      noDownvotingLimitError: null,
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
      noUpvotingLimitError,
      noDownvotingLimitError,
      minBudgetError,
      maxBudgetError,
      isValidated,
    } = validate(this.state, formatMessage);

    this.setState({
      noUpvotingLimitError,
      noDownvotingLimitError,
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
      konveio_enabled,
      isCustomInputTermEnabled,
    } = this.props;

    const className = this.props['className'];

    const {
      participation_method,
      posting_enabled,
      commenting_enabled,
      voting_enabled,
      upvoting_method,
      downvoting_method,
      upvoting_limited_max,
      downvoting_limited_max,
      downvoting_enabled,
      min_budget,
      max_budget,
      survey_embed_url,
      survey_service,
      loaded,
      noUpvotingLimitError,
      noDownvotingLimitError,
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
        konveio: konveio_enabled,
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
              />
            )}

            {participation_method === 'ideation' &&
              input_term &&
              typeof voting_enabled === 'boolean' &&
              typeof posting_enabled === 'boolean' &&
              typeof commenting_enabled === 'boolean' && (
                <IdeationInputs
                  isCustomInputTermEnabled={isCustomInputTermEnabled}
                  input_term={input_term}
                  handleInputTermChange={this.handleInputTermChange}
                  inputTermOptions={this.getInputTermOptions()}
                  posting_enabled={posting_enabled}
                  commenting_enabled={commenting_enabled}
                  voting_enabled={voting_enabled}
                  upvoting_method={upvoting_method}
                  downvoting_method={downvoting_method}
                  upvoting_limited_max={upvoting_limited_max}
                  downvoting_limited_max={downvoting_limited_max}
                  downvoting_enabled={downvoting_enabled}
                  noUpvotingLimitError={noUpvotingLimitError}
                  noDownvotingLimitError={noDownvotingLimitError}
                  apiErrors={apiErrors}
                  togglePostingEnabled={this.togglePostingEnabled}
                  toggleCommentingEnabled={this.toggleCommentingEnabled}
                  toggleVotingEnabled={this.toggleVotingEnabled}
                  handleUpvotingMethodOnChange={
                    this.handleUpvotingMethodOnChange
                  }
                  handleDownvotingMethodOnChange={
                    this.handleDownvotingMethodOnChange
                  }
                  handleUpvotingLimitOnChange={this.handleUpvotingLimitOnChange}
                  handleDownvotingLimitOnChange={
                    this.handleDownvotingLimitOnChange
                  }
                  handleDownvotingEnabledOnChange={
                    this.handleDownvotingEnabledOnChange
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
  konveio_enabled: <GetFeatureFlag name="konveio_surveys" />,
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
