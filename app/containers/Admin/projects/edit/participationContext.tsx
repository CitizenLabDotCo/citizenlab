import React, { PureComponent } from 'react';
import { Subscription, Observable, of } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isFinite, isEqual, omitBy, isNil } from 'lodash-es';

// components
import Input from 'components/UI/Input';
import Error from 'components/UI/Error';
import Label from 'components/UI/Label';
import Radio from 'components/UI/Radio';
import Toggle from 'components/UI/Toggle';
import Select from 'components/UI/Select';
import { Section, SectionField } from 'components/admin/Section';

// services
import { projectByIdStream, IProject } from 'services/projects';
import { phaseStream, IPhase } from 'services/phases';
import { ParticipationMethod, SurveyServices } from 'services/participationContexts';
import eventEmitter from 'utils/eventEmitter';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import FeatureFlag from 'components/FeatureFlag';
import { fontSizes } from 'utils/styleUtils';

// typings
import { IOption } from 'typings';

const Container = styled.div``;

const StyledSection = styled(Section)`
  margin-bottom: 0;
`;

const StyledSectionField = styled(SectionField)`
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const ToggleRow = Row.extend`
  margin-bottom: 10px;

  &.last {
    margin-bottom: 0px;
  }
`;

const ToggleLabel = styled(Label)`
  width: 100%;
  max-width: 200px;
  color: #333;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
`;

const VotingLimitInput = styled(Input)`
  width: 100px;
  height: 46px !important;
`;

export interface IParticipationContextConfig {
  participation_method: ParticipationMethod;
  posting_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  voting_enabled?: boolean | null;
  voting_method?: 'unlimited' | 'limited' | null;
  voting_limited_max?: number | null;
  presentation_mode?: 'map' | 'card' | null;
  max_budget?: number | null;
  currency?: string | null;
  survey_service?: SurveyServices | null;
  survey_embed_url?: string | null;
}

type Props = {
  onChange: (arg: IParticipationContextConfig) => void;
  onSubmit: (arg: IParticipationContextConfig) => void;
  projectId?: string | undefined | null;
  phaseId?: string | undefined | null;
};

interface State extends IParticipationContextConfig {
  noVotingLimit: JSX.Element | null;
  noBudgetingAmount: JSX.Element | null;
  loaded: boolean;
}

export default class ParticipationContext extends PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      participation_method: 'ideation',
      posting_enabled: true,
      commenting_enabled: true,
      voting_enabled: true,
      voting_method: 'unlimited',
      voting_limited_max: 5,
      presentation_mode: 'card',
      max_budget: null,
      currency: null,
      survey_service: null,
      survey_embed_url: null,
      loaded: false,
      noVotingLimit: null,
      noBudgetingAmount: null
    };
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
          const participation_method = data.data.attributes.participation_method as ParticipationMethod;
          const {
            posting_enabled,
            commenting_enabled,
            voting_enabled,
            voting_method,
            voting_limited_max,
            presentation_mode,
            max_budget,
            currency,
            survey_embed_url,
            survey_service,
          } = data.data.attributes;

          this.setState({
            participation_method,
            posting_enabled,
            commenting_enabled,
            voting_enabled,
            voting_method,
            voting_limited_max,
            presentation_mode,
            max_budget,
            currency,
            survey_embed_url,
            survey_service,
            loaded: true
          });
        } else {
          this.setState({ loaded: true });
        }
      }),

      eventEmitter
        .observeEvent('getParticipationContext')
        .pipe(filter(() => this.validate()))
        .subscribe(() => {
          const output = this.getOutput();
          this.props.onSubmit(output);
        })
    ];
  }

  getOutput = () => {
    const {
      participation_method,
      posting_enabled,
      commenting_enabled,
      voting_enabled,
      voting_method,
      voting_limited_max,
      presentation_mode,
      max_budget,
      currency,
      survey_embed_url,
      survey_service
    } = this.state;
    let output: IParticipationContextConfig = {} as any;

    if (participation_method === 'information') {
      output = {
        participation_method
      };
    } else if (participation_method === 'ideation') {
      output = omitBy({
        participation_method,
        posting_enabled,
        commenting_enabled,
        voting_enabled,
        presentation_mode,
        voting_method: (voting_enabled ? voting_method : null),
        voting_limited_max: (voting_enabled && voting_method === 'limited' ? voting_limited_max : null)
      }, isNil) as IParticipationContextConfig;
    } else if (participation_method === 'survey') {
      output = {
        participation_method,
        survey_embed_url,
        survey_service
      };
    } else if (participation_method === 'budgeting') {
      output = {
        participation_method,
        max_budget,
        currency
      };
    }

    return output;
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    const { noVotingLimit: prevNoVotingLimit, noBudgetingAmount: prevNoBudgetingAmount, loaded: prevLoaded, ...prevPartialState } = prevState;
    const { noVotingLimit: nextNoVotingLimit, noBudgetingAmount: nextNoBudgetingAmount, loaded: nextLoaded, ...nextPartialState } = this.state;

    if (!isEqual(prevPartialState, nextPartialState)) {
      const output = this.getOutput();
      this.props.onChange(output);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleParticipationMethodOnChange = (participation_method: ParticipationMethod) => {
    this.setState({
      participation_method,
      posting_enabled: (participation_method === 'ideation' ? true : null),
      commenting_enabled: (participation_method === 'ideation' ? true : null),
      voting_enabled: (participation_method === 'ideation' ? true : null),
      voting_method: (participation_method === 'ideation' ? 'unlimited' : null),
      voting_limited_max: null,
      presentation_mode: (participation_method === 'ideation' ? 'card' : null),
      survey_embed_url: null,
      survey_service: (participation_method === 'survey' ? 'typeform' : null),
      max_budget: (participation_method === 'budgeting' ? 1000 : null),
      currency: (participation_method === 'budgeting' ? 'EUR' : null)
    });
  }

  handleSurveyProviderChange = (survey_service: SurveyServices) => {
    this.setState({ survey_service });
  }

  handleSurveyEmbedUrlChange = (survey_embed_url: string) => {
    this.setState({ survey_embed_url });
  }

  togglePostingEnabled = () => {
    this.setState((state) => ({ posting_enabled: !state.posting_enabled }));
  }

  toggleCommentingEnabled = () => {
    this.setState((state) => ({ commenting_enabled: !state.commenting_enabled }));
  }

  toggleVotingEnabled = () => {
    this.setState((state) => ({ voting_enabled: !state.voting_enabled }));
  }

  handeVotingMethodOnChange = (voting_method: 'unlimited' | 'limited') => {
    this.setState({
      voting_method,
      voting_limited_max: (voting_method === 'unlimited' ? null : 5)
    });
  }

  handleVotingLimitOnChange = (voting_limited_max: string) => {
    this.setState({ voting_limited_max: parseInt(voting_limited_max, 10), noVotingLimit: null });
  }

  handleIdeasDisplayChange = (presentation_mode: 'map' | 'card') => {
    this.setState({ presentation_mode });
  }

  handleBudgetingAmountChange = (max_budget: string) => {
    this.setState({ max_budget: parseInt(max_budget, 10), noBudgetingAmount: null });
  }

  handleBudgetingCurrencyChange = (budgetingCurrencyOption: IOption) => {
    const currency = budgetingCurrencyOption.value as string;
    this.setState({ currency });
  }

  validate() {
    let isValidated = true;
    let noVotingLimit: JSX.Element | null = null;
    let noBudgetingAmount: JSX.Element | null = null;
    const { voting_method, voting_limited_max, participation_method, max_budget } = this.state;

    if (voting_method === 'limited' && (!voting_limited_max || !isFinite(voting_limited_max) || voting_limited_max < 1)) {
      noVotingLimit = <FormattedMessage {...messages.noVotingLimitErrorMessage} />;
      isValidated = false;
    } else if (participation_method === 'budgeting' && !(parseInt(max_budget as any, 10) > 0)) {
      noBudgetingAmount = <FormattedMessage {...messages.noBudgetingAmountErrorMessage} />;
      isValidated = false;
    }

    this.setState({ noVotingLimit, noBudgetingAmount });

    return isValidated;
  }

  render() {
    const className = this.props['className'];
    const {
      participation_method,
      posting_enabled,
      commenting_enabled,
      voting_enabled,
      voting_method,
      voting_limited_max,
      presentation_mode,
      max_budget,
      currency,
      survey_embed_url,
      survey_service,
      loaded,
      noVotingLimit,
      noBudgetingAmount,
    } = this.state;
    const currencyCodes = ['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYR', 'BZD', 'CAD', 'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LTL', 'LVL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRO', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STD', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'USS', 'UYI', 'UYU', 'UZS', 'VEF', 'VND', 'VUV', 'WST', 'XAF', 'XAG', 'XAU', 'XBA', 'XBB', 'XBC', 'XBD', 'XCD', 'XDR', 'XFU', 'XOF', 'XPD', 'XPF', 'XPT', 'XTS', 'XXX', 'YER', 'ZAR', 'ZMW'];
    const currencyCodeOptions = currencyCodes.map((currencyCode) => ({
      value: currencyCode,
      label: currencyCode
    }));

    if (loaded) {
      return (
        <Container className={className}>
          <StyledSection>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.participationMethod} />
              </Label>
              {['ideation', 'information'].map((method) => (
                <Radio
                  onChange={this.handleParticipationMethodOnChange}
                  currentValue={participation_method}
                  value={method}
                  name="participationmethod"
                  id={`participationmethod-${method}`}
                  label={<FormattedMessage {...messages[method]} />}
                  key={method}
                />
              ))}
              <FeatureFlag name="surveys">
                <Radio
                  onChange={this.handleParticipationMethodOnChange}
                  currentValue={participation_method}
                  value="survey"
                  name="participationmethod"
                  id={'participationmethod-survey'}
                  label={<FormattedMessage {...messages.survey} />}
                />
              </FeatureFlag>
              {/* <FeatureFlag name="participatory_budgeting"> */}
                <Radio
                  onChange={this.handleParticipationMethodOnChange}
                  currentValue={participation_method}
                  value="budgeting"
                  name="participationmethod"
                  id={'participationmethod-budgeting'}
                  label={<FormattedMessage {...messages.participatoryBudgeting} />}
                />
              {/* </FeatureFlag> */}
            </SectionField>

            {participation_method === 'budgeting' &&
              <>
                <SectionField>
                  <Label>
                    <FormattedMessage {...messages.amountPerCitizen} />
                  </Label>
                  <Input
                    onChange={this.handleBudgetingAmountChange}
                    type="number"
                    min="1"
                    placeholder=""
                    value={(max_budget ? max_budget.toString() : null)}
                  />
                  <Error text={noBudgetingAmount} />
                </SectionField>
                <SectionField>
                  <Label>
                    <FormattedMessage {...messages.amountPerCitizen} />
                  </Label>
                  <Select
                    options={currencyCodeOptions}
                    onChange={this.handleBudgetingCurrencyChange}
                    value={{ label: currency as string, value: currency }}
                    clearable={false}
                  />
                </SectionField>
              </>
            }

            {participation_method === 'ideation' &&
              <>
                <StyledSectionField>
                  <Label>
                    <FormattedMessage {...messages.phasePermissions} />
                  </Label>

                  <ToggleRow>
                    <ToggleLabel>
                      <FormattedMessage {...messages.postingEnabled} />
                    </ToggleLabel>
                    <Toggle value={posting_enabled as boolean} onChange={this.togglePostingEnabled} />
                  </ToggleRow>

                  <ToggleRow>
                    <ToggleLabel>
                      <FormattedMessage {...messages.commentingEnabled} />
                    </ToggleLabel>
                    <Toggle value={commenting_enabled as boolean} onChange={this.toggleCommentingEnabled} />
                  </ToggleRow>

                  <ToggleRow className="last">
                    <ToggleLabel>
                      <FormattedMessage {...messages.votingEnabled} />
                    </ToggleLabel>
                    <Toggle value={voting_enabled as boolean} onChange={this.toggleVotingEnabled} />
                  </ToggleRow>
                </StyledSectionField>
                {voting_enabled &&
                  <SectionField>
                    <Label>
                      <FormattedMessage {...messages.votingMethod} />
                    </Label>
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
                    {participation_method === 'ideation' && voting_method === 'limited' &&
                      <>
                        <Label htmlFor="voting-title">
                          <FormattedMessage {...messages.votingLimit} />
                        </Label>
                        <VotingLimitInput
                          id="voting-limit"
                          type="number"
                          min="1"
                          placeholder=""
                          value={(voting_limited_max ? voting_limited_max.toString() : null)}
                          onChange={this.handleVotingLimitOnChange}
                        />
                        <Error text={noVotingLimit} />
                      </>
                    }
                  </SectionField>
                }
                <SectionField>
                  <Label>
                    <FormattedMessage {...messages.defaultDisplay} />
                  </Label>
                  {['card', 'map'].map((key) => (
                    <Radio
                      key={key}
                      onChange={this.handleIdeasDisplayChange}
                      currentValue={presentation_mode}
                      value={key}
                      name="presentation_mode"
                      id={`presentation_mode-${key}`}
                      label={<FormattedMessage {...messages[`${key}Display`]} />}
                    />
                  ))}
                </SectionField>
              </>
            }

            {participation_method === 'survey' &&
              <>
                <SectionField>
                  <Label>
                    <FormattedMessage {...messages.surveyService} />
                  </Label>
                  {['typeform', 'survey_monkey'].map((provider) => (
                    <Radio
                      onChange={this.handleSurveyProviderChange}
                      currentValue={survey_service}
                      value={provider}
                      name="survey-provider"
                      id={`survey-provider-${provider}`}
                      label={<FormattedMessage {...messages[provider]} />}
                      key={provider}
                    />
                  ))}
                </SectionField>
                <SectionField>
                  <Label>
                    <FormattedMessage {...messages.surveyEmbedUrl} />
                  </Label>
                  <Input
                    onChange={this.handleSurveyEmbedUrlChange}
                    type="text"
                    value={survey_embed_url}
                  />
                </SectionField>
              </>
            }

          </StyledSection>
        </Container>
      );
    }

    return null;
  }
}
