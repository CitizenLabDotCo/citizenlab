import React, { PureComponent } from 'react';
import { Subscription, Observable, of } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isEqual } from 'lodash-es';

// components
import { Input, Radio, IconTooltip, Toggle } from 'cl2-component-library';
import Error from 'components/UI/Error';
import ParticipationMethodPicker from './components/ParticipationMethodPicker';
import ParticipatoryBudgetingInputs from './components/ParticipatoryBudgetingInputs';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import {
  Container,
  StyledSection,
  StyledA,
  StyledWarning,
  StyledSelect,
} from './styling';

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
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// typings
import { CLError } from 'typings';
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
  survey_monkey_enabled: GetFeatureFlagChildProps;
  isCustomInputTermEnabled: GetFeatureFlagChildProps;
}

interface InputProps {
  onChange: (arg: IParticipationContextConfig) => void;
  onSubmit: (arg: IParticipationContextConfig) => void;
  projectId?: string | undefined | null;
  phaseId?: string | undefined | null;
  apiErrors?: { [fieldName: string]: CLError[] } | null;
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
      noVotingLimit: prevNoVotingLimit,
      loaded: prevLoaded,
      ...prevPartialState
    } = prevState;
    const {
      noVotingLimit: nextNoVotingLimit,
      loaded: nextLoaded,
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
      };
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
      survey_monkey_enabled,
      google_forms_enabled,
      intl: { formatMessage },
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
      const showSurveys =
        surveys_enabled &&
        anyIsDefined(
          typeform_enabled,
          enalyzer_enabled,
          survey_xact_enabled,
          qualtrics_enabled,
          survey_monkey_enabled,
          google_forms_enabled
        );

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

            {(participation_method === 'budgeting' ||
              participation_method === 'ideation') &&
              isCustomInputTermEnabled && (
                <SectionField>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.inputTermSelectLabel} />
                  </SubSectionTitle>
                  <StyledSelect
                    value={input_term}
                    options={this.getInputTermOptions()}
                    onChange={this.handleInputTermChange}
                  />
                </SectionField>
              )}

            {participation_method === 'budgeting' && (
              <ParticipatoryBudgetingInputs
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
              <>
                <SectionField>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.anonymousPolling} />
                    <IconTooltip
                      content={
                        <FormattedMessage
                          {...messages.anonymousPollingTooltip}
                        />
                      }
                    />
                  </SubSectionTitle>

                  <Toggle
                    checked={poll_anonymous as boolean}
                    onChange={this.togglePollAnonymous}
                  />

                  <Error apiErrors={apiErrors && apiErrors.poll_anonymous} />
                </SectionField>
              </>
            )}

            {participation_method === 'survey' && (
              <>
                <SectionField>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.surveyService} />
                    <IconTooltip
                      content={
                        <FormattedMessage
                          {...messages.surveyServiceTooltip}
                          values={{
                            surveyServiceTooltipLink: (
                              <StyledA
                                href={formatMessage(
                                  messages.surveyServiceTooltipLink
                                )}
                                target="_blank"
                              >
                                <FormattedMessage
                                  {...messages.surveyServiceTooltipLinkText}
                                />
                              </StyledA>
                            ),
                          }}
                        />
                      }
                    />
                  </SubSectionTitle>
                  <StyledWarning>
                    <FormattedMessage
                      {...messages.hiddenFieldsTip}
                      values={{
                        hiddenFieldsLink: (
                          <a
                            href={formatMessage(
                              messages.hiddenFieldsSupportArticleUrl
                            )}
                            target="_blank"
                          >
                            {formatMessage(messages.hiddenFieldsLinkText)}
                          </a>
                        ),
                      }}
                    />
                  </StyledWarning>
                  {[
                    'typeform',
                    'survey_monkey',
                    'google_forms',
                    'enalyzer',
                    'survey_xact',
                    'qualtrics',
                  ].map((provider) => {
                    if (this.props[`${provider}_enabled`]) {
                      return (
                        <Radio
                          onChange={this.handleSurveyProviderChange}
                          currentValue={survey_service}
                          value={provider}
                          name="survey-provider"
                          id={`survey-provider-${provider}`}
                          label={<FormattedMessage {...messages[provider]} />}
                          key={provider}
                        />
                      );
                    }
                    return null;
                  })}
                  <Error apiErrors={apiErrors && apiErrors.survey_service} />
                </SectionField>
                <SectionField>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.surveyEmbedUrl} />
                  </SubSectionTitle>
                  <Input
                    onChange={this.handleSurveyEmbedUrlChange}
                    type="text"
                    value={survey_embed_url}
                  />
                  <Error apiErrors={apiErrors && apiErrors.survey_embed_url} />
                </SectionField>
              </>
            )}
          </StyledSection>
        </Container>
      );
    }
    return null;
  }
}

const Data = adopt<DataProps, {}>({
  surveys_enabled: <GetFeatureFlag name="surveys" />,
  typeform_enabled: <GetFeatureFlag name="typeform_surveys" />,
  google_forms_enabled: <GetFeatureFlag name="google_forms_surveys" />,
  survey_monkey_enabled: <GetFeatureFlag name="surveymonkey_surveys" />,
  enalyzer_enabled: <GetFeatureFlag name="enalyzer_surveys" />,
  survey_xact_enabled: <GetFeatureFlag name="survey_xact_surveys" />,
  qualtrics_enabled: <GetFeatureFlag name="qualtrics_surveys" />,
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
