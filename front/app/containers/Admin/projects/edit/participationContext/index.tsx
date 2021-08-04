import React, { PureComponent } from 'react';
import { Subscription, Observable, of } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isEqual } from 'lodash-es';

// components
import { Input, Radio, IconTooltip, Toggle } from 'cl2-component-library';
import Error from 'components/UI/Error';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import FeatureFlag from 'components/FeatureFlag';
import { LabelHeaderTooltip } from './components/labels';

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

// style
import {
  Container,
  StyledSection,
  StyledSectionField,
  ToggleRow,
  ToggleLabel,
  VotingLimitInput,
  BudgetingAmountInput,
  BudgetingAmountInputError,
  StyledA,
  StyledWarning,
  StyledSelect,
} from './styling';

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
import ParticipationMethodPicker from './components/ParticipationMethodPicker';
import { anyIsDefined } from 'utils/helperUtils';

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

      const minBudgetInputValue =
        // need to check the type because if min_budget is 0,
        // it'll evaluate to null
        typeof min_budget === 'number' ? min_budget.toString() : null;
      const maxBudgetInputValue =
        // maxBudget can't be lower than 1, but it's still a good practice
        // to check for type instead of relying on JS type coercion
        typeof max_budget === 'number' ? max_budget.toString() : null;

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
              <>
                <SectionField>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.totalBudget} />
                  </SubSectionTitle>
                  <BudgetingAmountInput
                    onChange={this.handleMinBudgetingAmountChange}
                    type="number"
                    min="0"
                    value={minBudgetInputValue}
                    label={
                      <LabelHeaderTooltip
                        header="minimum"
                        tooltip="minimumTooltip"
                      />
                    }
                  />
                  <BudgetingAmountInputError text={minBudgetError} />
                  <BudgetingAmountInputError
                    apiErrors={apiErrors && apiErrors.min_budget}
                  />
                </SectionField>
                <SectionField>
                  <BudgetingAmountInput
                    onChange={this.handleMaxBudgetingAmountChange}
                    type="number"
                    min="1"
                    value={maxBudgetInputValue}
                    label={
                      <LabelHeaderTooltip
                        header="maximum"
                        tooltip="maximumTooltip"
                      />
                    }
                  />
                  <BudgetingAmountInputError text={maxBudgetError} />
                  <BudgetingAmountInputError
                    apiErrors={apiErrors && apiErrors.max_budget}
                  />
                </SectionField>
                <SectionField>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.phasePermissions} />
                  </SubSectionTitle>

                  <ToggleRow>
                    <ToggleLabel>
                      <FormattedMessage {...messages.inputCommentingEnabled} />
                    </ToggleLabel>
                    <Toggle
                      checked={commenting_enabled as boolean}
                      onChange={this.toggleCommentingEnabled}
                    />
                  </ToggleRow>
                  <Error
                    apiErrors={apiErrors && apiErrors.commenting_enabled}
                  />
                </SectionField>
              </>
            )}

            {participation_method === 'ideation' && input_term && (
              <>
                <StyledSectionField>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.phasePermissions} />
                    <IconTooltip
                      content={
                        <FormattedMessage
                          {...messages.phasePermissionsTooltip}
                        />
                      }
                    />
                  </SubSectionTitle>

                  <ToggleRow>
                    <ToggleLabel>
                      <FormattedMessage {...messages.inputPostingEnabled} />
                    </ToggleLabel>
                    <Toggle
                      checked={posting_enabled as boolean}
                      onChange={this.togglePostingEnabled}
                    />
                    <Error apiErrors={apiErrors && apiErrors.posting_enabled} />
                  </ToggleRow>

                  <ToggleRow>
                    <ToggleLabel>
                      <FormattedMessage {...messages.inputCommentingEnabled} />
                    </ToggleLabel>
                    <Toggle
                      checked={commenting_enabled as boolean}
                      onChange={this.toggleCommentingEnabled}
                    />
                    <Error
                      apiErrors={apiErrors && apiErrors.commenting_enabled}
                    />
                  </ToggleRow>

                  <ToggleRow className="last">
                    <ToggleLabel>
                      <FormattedMessage {...messages.inputVotingEnabled} />
                    </ToggleLabel>
                    <Toggle
                      checked={voting_enabled as boolean}
                      onChange={this.toggleVotingEnabled}
                    />
                    <Error apiErrors={apiErrors && apiErrors.voting_enabled} />
                  </ToggleRow>
                </StyledSectionField>
                {voting_enabled && (
                  <>
                    <SectionField>
                      <SubSectionTitle>
                        <FormattedMessage {...messages.votingMethod} />
                        <IconTooltip
                          content={
                            <FormattedMessage
                              {...messages.votingMaximumTooltip}
                            />
                          }
                        />
                      </SubSectionTitle>
                      <Radio
                        onChange={this.handeVotingMethodOnChange}
                        currentValue={voting_method}
                        value="unlimited"
                        name="votingmethod"
                        id="votingmethod-unlimited"
                        label={<FormattedMessage {...messages.unlimited} />}
                      />
                      <Radio
                        onChange={this.handeVotingMethodOnChange}
                        currentValue={voting_method}
                        value="limited"
                        name="votingmethod"
                        id="votingmethod-limited"
                        label={<FormattedMessage {...messages.limited} />}
                      />
                      <Error apiErrors={apiErrors && apiErrors.voting_method} />

                      {participation_method === 'ideation' &&
                        voting_method === 'limited' && (
                          <>
                            <SubSectionTitle>
                              <FormattedMessage {...messages.votingLimit} />
                            </SubSectionTitle>
                            <VotingLimitInput
                              id="voting-limit"
                              type="number"
                              min="1"
                              placeholder=""
                              value={
                                voting_limited_max
                                  ? voting_limited_max.toString()
                                  : null
                              }
                              onChange={this.handleVotingLimitOnChange}
                            />
                            <Error
                              text={noVotingLimit}
                              apiErrors={apiErrors && apiErrors.voting_limit}
                            />
                          </>
                        )}
                    </SectionField>

                    <FeatureFlag name="disable_downvoting">
                      <SectionField>
                        <SubSectionTitle>
                          <FormattedMessage {...messages.downvoting} />
                          <IconTooltip
                            content={
                              <FormattedMessage
                                {...messages.disableDownvotingTooltip}
                              />
                            }
                          />
                        </SubSectionTitle>
                        <Radio
                          onChange={this.handleDownvotingEnabledOnChange}
                          currentValue={downvoting_enabled}
                          value={true}
                          name="enableDownvoting"
                          id="enableDownvoting-true"
                          label={
                            <FormattedMessage {...messages.downvotingEnabled} />
                          }
                        />
                        <Radio
                          onChange={this.handleDownvotingEnabledOnChange}
                          currentValue={downvoting_enabled}
                          value={false}
                          name="enableDownvoting"
                          id="enableDownvoting-false"
                          label={
                            <FormattedMessage
                              {...messages.downvotingDisabled}
                            />
                          }
                        />
                        <Error
                          apiErrors={apiErrors && apiErrors.downvoting_enabled}
                        />
                      </SectionField>
                    </FeatureFlag>
                  </>
                )}
              </>
            )}

            {(participation_method === 'ideation' ||
              participation_method === 'budgeting') && (
              <>
                <SectionField>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.inputsDefaultView} />
                    <IconTooltip
                      content={
                        <FormattedMessage
                          {...messages.inputsDefaultViewTooltip}
                        />
                      }
                    />
                  </SubSectionTitle>
                  {['card', 'map'].map((key) => (
                    <Radio
                      key={key}
                      onChange={this.handleIdeasDisplayChange}
                      currentValue={presentation_mode}
                      value={key}
                      name="presentation_mode"
                      id={`presentation_mode-${key}`}
                      label={
                        <FormattedMessage {...messages[`${key}Display`]} />
                      }
                    />
                  ))}
                  <Error apiErrors={apiErrors && apiErrors.presentation_mode} />
                </SectionField>
                <SectionField>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.defaultSorting} />
                    <IconTooltip
                      content={
                        <FormattedMessage
                          {...messages.defaultPostSortingTooltip}
                        />
                      }
                    />
                  </SubSectionTitle>
                  {[
                    { key: 'trending', value: 'trending' },
                    { key: 'random', value: 'random' },
                    { key: 'popular', value: 'popular' },
                    { key: 'newest', value: 'new' },
                    { key: 'oldest', value: '-new' },
                  ].map(({ key, value }) => (
                    <Radio
                      key={key}
                      onChange={this.handleIdeaDefaultSortMethodChange}
                      currentValue={ideas_order}
                      value={value}
                      name="IdeaDefaultSortMethod"
                      id={`ideas_order-${key}`}
                      label={
                        <FormattedMessage
                          {...messages[`${key}SortingMethod`]}
                        />
                      }
                    />
                  ))}
                  <Error apiErrors={apiErrors && apiErrors.presentation_mode} />
                </SectionField>
              </>
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
