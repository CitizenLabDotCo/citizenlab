import React, { PureComponent } from 'react';
import { Subscription, Observable, of } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isEqual } from 'lodash-es';

// components
import ParticipationMethodPicker from './components/ParticipationMethodPicker';
import ParticipatoryBudgetingInputs from './components/ParticipatoryBudgetingInputs';
import PollInputs from './components/PollInputs';
import SurveyInputs from './components/SurveyInputs';
import { Container, StyledSection } from './components/styling';

// services
import { projectByIdStream, IProject } from 'services/projects';
import { phaseStream, IPhase } from 'services/phases';
import {
  ParticipationMethod,
  SurveyServices,
  IdeaDefaultSortMethod,
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
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// typings
import { CLErrors } from 'typings';
import { adopt } from 'react-adopt';
import { IOption } from 'cl2-component-library/dist/utils/typings';

// utils
import getOutput from './utils/getOutput';
import {
  getDefaultState,
  getNewStateFromData,
  getStateFromParticipationMethod,
} from './utils/state';
import validate from './utils/validate';
import { anyIsDefined } from 'utils/helperUtils';
import IdeationInputs from './components/IdeationInputs';

export interface IParticipationContextConfig {
  participation_method: ParticipationMethod;
  posting_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  voting_enabled?: boolean | null;
  voting_method?: 'unlimited' | 'limited' | null;
  voting_limited_max?: number | null;
  downvoting_enabled?: boolean | null;
  presentation_mode?: 'map' | 'card' | null;
  ideas_order?: IdeaDefaultSortMethod;
  input_term?: InputTerm;
  min_budget?: number | null;
  max_budget?: number | null;
  survey_service?: SurveyServices | null;
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
  microsoft_forms_enabled: GetFeatureFlagChildProps;
  survey_monkey_enabled: GetFeatureFlagChildProps;
  isCustomInputTermEnabled: GetFeatureFlagChildProps;
}

export type ApiErrors = CLErrors | null | undefined;

interface InputProps {
  onChange: (arg: IParticipationContextConfig) => void;
  onSubmit: (arg: IParticipationContextConfig) => void;
  projectId?: string | undefined | null;
  phaseId?: string | undefined | null;
  apiErrors: ApiErrors;
}

interface Props extends DataProps, InputProps {}

export interface State extends IParticipationContextConfig {
  noVotingLimit: JSX.Element | null;
  minBudgetError: string | null;
  maxBudgetError: string | null;
  loaded: boolean;
}

class ParticipationContext extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  subscriptions: Subscription[];

  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = getDefaultState();
    this.subscriptions = [];
  }

  componentDidMount() {
    const { projectId, phaseId } = this.props;
    let data$: Observable<IProject | IPhase | null> = of(null);

    if (projectId) {
      data$ = projectByIdStream(projectId).observable;
    } else if (phaseId) {
      data$ = phaseStream(phaseId).observable;
    }
    this.subscriptions = [
      data$.subscribe((data) => {
        if (data) {
          this.setState(getNewStateFromData(data.data.attributes));
        } else {
          this.setState({ loaded: true });
        }
      }),

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
      noVotingLimit: _prevNoVotingLimit,
      loaded: _prevLoaded,
      ...prevPartialState
    } = prevState;
    const {
      noVotingLimit: _nextNoVotingLimit,
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
    this.setState(getStateFromParticipationMethod(participation_method));
  };

  handleSurveyProviderChange = (survey_service: SurveyServices) => {
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

  handeVotingMethodOnChange = (voting_method: 'unlimited' | 'limited') => {
    this.setState({
      voting_method,
      voting_limited_max: voting_method === 'unlimited' ? null : 5,
    });
  };

  handleVotingLimitOnChange = (voting_limited_max: string) => {
    this.setState({
      voting_limited_max: parseInt(voting_limited_max, 10),
      noVotingLimit: null,
    });
  };

  handleDownvotingEnabledOnChange = (downvoting_enabled: boolean) => {
    this.setState({ downvoting_enabled });
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
      noVotingLimit,
      minBudgetError,
      maxBudgetError,
      isValidated,
    } = validate(this.state, formatMessage);

    this.setState({ noVotingLimit, minBudgetError, maxBudgetError });

    return isValidated;
  }

  getInputTermOptions = () => {
    return INPUT_TERMS.map((inputTerm: InputTerm) => {
      const labelMessages: {
        [key in InputTerm]: ReactIntl.FormattedMessage.MessageDescriptor;
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
      microsoft_forms_enabled,
      survey_monkey_enabled,
      google_forms_enabled,
      isCustomInputTermEnabled,
    } = this.props;

    const className = this.props['className'];

    const {
      participation_method,
      posting_enabled,
      commenting_enabled,
      voting_enabled,
      voting_method,
      voting_limited_max,
      downvoting_enabled,
      min_budget,
      max_budget,
      survey_embed_url,
      survey_service,
      loaded,
      noVotingLimit,
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
        microsoft_forms: microsoft_forms_enabled,
        survey_monkey: survey_monkey_enabled,
        google_forms: google_forms_enabled,
      };

      const showSurveys =
        surveys_enabled && anyIsDefined(...Object.values(surveyProviders));

      return (
        <Container className={className}>
          <StyledSection>
            <ParticipationMethodPicker
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

            {participation_method === 'ideation' && input_term && (
              <IdeationInputs
                isCustomInputTermEnabled={isCustomInputTermEnabled}
                input_term={input_term}
                handleInputTermChange={this.handleInputTermChange}
                inputTermOptions={this.getInputTermOptions()}
                posting_enabled={posting_enabled}
                commenting_enabled={commenting_enabled}
                voting_enabled={voting_enabled}
                voting_method={voting_method}
                voting_limited_max={voting_limited_max}
                downvoting_enabled={downvoting_enabled}
                noVotingLimit={noVotingLimit}
                apiErrors={apiErrors}
                togglePostingEnabled={this.togglePostingEnabled}
                toggleCommentingEnabled={this.toggleCommentingEnabled}
                toggleVotingEnabled={this.toggleVotingEnabled}
                handeVotingMethodOnChange={this.handeVotingMethodOnChange}
                handleVotingLimitOnChange={this.handleVotingLimitOnChange}
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
  microsoft_forms_enabled: <GetFeatureFlag name="microsoft_forms_surveys" />,
  isCustomInputTermEnabled: <GetFeatureFlag name="idea_custom_copy" />,
});

const ParticipationContextWithIntl = injectIntl(ParticipationContext);

export default (inputProps: InputProps) => (
  <Data>
    {(dataProps) => (
      <ParticipationContextWithIntl {...inputProps} {...dataProps} />
    )}
  </Data>
);
