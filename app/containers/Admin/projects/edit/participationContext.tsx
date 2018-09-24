import React from 'react';
import { Subscription, Observable, of } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isFinite, isEqual } from 'lodash-es';

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
  participationMethod: ParticipationMethod;
  postingEnabled: boolean | null;
  commentingEnabled: boolean | null;
  votingEnabled: boolean | null;
  votingMethod: 'unlimited' | 'limited' | null;
  votingLimit: number | null;
  presentationMode: 'map' | 'card' | null;
  budgetingAmount: number | null;
  budgetingCurrency: string | null;
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
  loaded: boolean;
}

export default class ParticipationContext extends React.PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      participationMethod: 'ideation',
      postingEnabled: true,
      commentingEnabled: true,
      votingEnabled: true,
      votingMethod: 'unlimited',
      votingLimit: 5,
      noVotingLimit: null,
      budgetingAmount: null,
      budgetingCurrency: null,
      loaded: false,
      presentationMode: 'card'
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
          const {
            participation_method,
            posting_enabled,
            commenting_enabled,
            voting_enabled,
            voting_method,
            voting_limited_max,
            presentation_mode,
            survey_embed_url,
            survey_service,
          } = data.data.attributes;

          this.setState({
            survey_embed_url,
            survey_service,
            participationMethod: participation_method as ParticipationMethod,
            postingEnabled: posting_enabled,
            commentingEnabled: commenting_enabled,
            votingEnabled: voting_enabled,
            votingMethod: voting_method,
            votingLimit: voting_limited_max,
            presentationMode: presentation_mode,
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
    const { participationMethod, postingEnabled, commentingEnabled, votingEnabled, votingMethod, votingLimit, presentationMode, survey_embed_url, survey_service, budgetingAmount, budgetingCurrency } = this.state;
    return {
      participationMethod,
      postingEnabled: (participationMethod === 'ideation' ? postingEnabled : null),
      commentingEnabled: (participationMethod === 'ideation' ? commentingEnabled : null),
      votingEnabled: (participationMethod === 'ideation' ? votingEnabled : null),
      votingMethod: (participationMethod === 'ideation' ? votingMethod : null),
      votingLimit: (participationMethod === 'ideation' && votingMethod === 'limited' ? votingLimit : null),
      presentationMode: (participationMethod === 'ideation' ? presentationMode : null),
      survey_embed_url: (participationMethod === 'survey' ? survey_embed_url : null),
      survey_service: (participationMethod === 'survey' ? survey_service : null),
      budgetingAmount: (participationMethod === 'budgeting' ? budgetingAmount : null),
      budgetingCurrency: (participationMethod === 'budgeting' ? budgetingCurrency : null),
    };
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    const { noVotingLimit: prevNoVotingLimit , loaded: prevLoaded, ...prevPartialState } = prevState;
    const { noVotingLimit: nextNoVotingLimit, loaded: nextLoaded, ...nextPartialState } = this.state;

    if (!isEqual(prevPartialState, nextPartialState)) {
      const output = this.getOutput();
      this.props.onChange(output);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleParticipationMethodOnChange = (participationMethod: ParticipationMethod) => {
    this.setState({
      participationMethod,
      postingEnabled: (participationMethod === 'ideation' ? true : null),
      commentingEnabled: (participationMethod === 'ideation' ? true : null),
      votingEnabled: (participationMethod === 'ideation' ? true : null),
      votingMethod: (participationMethod === 'ideation' ? 'unlimited' : null),
      votingLimit: null,
      presentationMode: (participationMethod === 'ideation' ? 'card' : null),
      survey_embed_url: null,
      survey_service: (participationMethod === 'survey' ? 'typeform' : null),
      budgetingAmount: (participationMethod === 'budgeting' ? 1000 : null),
      budgetingCurrency: (participationMethod === 'budgeting' ? 'EUR' : null)
    });
  }

  handleSurveyProviderChange = (survey_service: SurveyServices) => {
    this.setState({ survey_service });
  }

  handleSurveyEmbedUrlChange = (survey_embed_url: string) => {
    this.setState({ survey_embed_url });
  }

  togglePostingEnabled = () => {
    this.setState((state: State) => ({ postingEnabled: !state.postingEnabled }));
  }

  toggleCommentingEnabled = () => {
    this.setState((state: State) => ({ commentingEnabled: !state.commentingEnabled }));
  }

  toggleVotingEnabled = () => {
    this.setState((state: State) => ({ votingEnabled: !state.votingEnabled }));
  }

  handeVotingMethodOnChange = (votingMethod: 'unlimited' | 'limited') => {
    this.setState({
      votingMethod,
      votingLimit: (votingMethod === 'unlimited' ? null : 5)
    });
  }

  handleVotingLimitOnChange = (votingLimit: string) => {
    this.setState({ votingLimit: parseInt(votingLimit, 10) });
  }

  handleIdeasDisplayChange = (presentationMode: 'map' | 'card') => {
    this.setState({ presentationMode });
  }

  handleBudgetingAmountChange = (amount: string) => {
    this.setState({ budgetingAmount: parseInt(amount, 10) });
  }

  handleBudgetingCurrencyChange = (budgetingCurrencyOption: IOption) => {
    const budgetingCurrency = budgetingCurrencyOption.value as string;
    this.setState({ budgetingCurrency });
  }

  validate() {
    let isValidated = true;
    let noVotingLimit: JSX.Element | null = null;
    const { votingMethod, votingLimit } = this.state;

    if (votingMethod === 'limited' && (!votingLimit || !isFinite(votingLimit) || votingLimit < 1)) {
      noVotingLimit = <FormattedMessage {...messages.noVotingLimitErrorMessage} />;
      isValidated = false;
    }

    this.setState({ noVotingLimit });

    return isValidated;
  }

  render() {
    const className = this.props['className'];
    const {
      participationMethod,
      postingEnabled,
      commentingEnabled,
      votingEnabled,
      loaded,
      survey_service,
      survey_embed_url,
      votingMethod,
      votingLimit,
      noVotingLimit,
      budgetingAmount,
      budgetingCurrency,
      presentationMode
    } = this.state;
    const currencyCodes = ['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYR', 'BZD', 'CAD', 'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LTL', 'LVL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRO', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STD', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'USS', 'UYI', 'UYU', 'UZS', 'VEF', 'VND', 'VUV', 'WST', 'XAF', 'XAG', 'XAU', 'XBA', 'XBB', 'XBC', 'XBD', 'XCD', 'XDR', 'XFU', 'XOF', 'XPD', 'XPF', 'XPT', 'XTS', 'XXX', 'YER', 'ZAR', 'ZMW'];
    const currencyCodeOptions = currencyCodes.map((currencyCode) => ({
      value: currencyCode,
      label: currencyCode
    }));

    const votingLimitSection = (participationMethod === 'ideation' && votingMethod === 'limited') ? (
      <>
        <Label htmlFor="voting-title">
          <FormattedMessage {...messages.votingLimit} />
        </Label>
        <VotingLimitInput
          id="voting-limit"
          type="number"
          min="1"
          placeholder=""
          value={(votingLimit ? votingLimit.toString() : null)}
          onChange={this.handleVotingLimitOnChange}
        />
        {/* <Error fieldName="title_multiloc" apiErrors={this.state.apiErrors.title_multiloc} /> */}
      </>
    ) : null;

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
                  currentValue={participationMethod}
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
                  currentValue={participationMethod}
                  value="survey"
                  name="participationmethod"
                  id={'participationmethod-survey'}
                  label={<FormattedMessage {...messages.survey} />}
                />
              </FeatureFlag>
              {/* <FeatureFlag name="participatory_budgeting"> */}
                <Radio
                  onChange={this.handleParticipationMethodOnChange}
                  currentValue={participationMethod}
                  value="budgeting"
                  name="participationmethod"
                  id={'participationmethod-budgeting'}
                  label={<FormattedMessage {...messages.participatoryBudgeting} />}
                />
              {/* </FeatureFlag> */}
            </SectionField>

            {participationMethod === 'budgeting' &&
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
                    value={(budgetingAmount ? budgetingAmount.toString() : null)}
                  />
                  <Label>
                    <FormattedMessage {...messages.amountPerCitizen} />
                  </Label>
                  <Select
                    options={currencyCodeOptions}
                    onChange={this.handleBudgetingCurrencyChange}
                    value={{ label: budgetingCurrency as string, value: budgetingCurrency }}
                    clearable={false}
                  />
                </SectionField>
              </>
            }

            {participationMethod === 'ideation' &&
              <>
                <StyledSectionField>
                  <Label>
                    <FormattedMessage {...messages.phasePermissions} />
                  </Label>

                  <ToggleRow>
                    <ToggleLabel>
                      <FormattedMessage {...messages.postingEnabled} />
                    </ToggleLabel>
                    <Toggle value={postingEnabled as boolean} onChange={this.togglePostingEnabled} />
                  </ToggleRow>

                  <ToggleRow>
                    <ToggleLabel>
                      <FormattedMessage {...messages.commentingEnabled} />
                    </ToggleLabel>
                    <Toggle value={commentingEnabled as boolean} onChange={this.toggleCommentingEnabled} />
                  </ToggleRow>

                  <ToggleRow className="last">
                    <ToggleLabel>
                      <FormattedMessage {...messages.votingEnabled} />
                    </ToggleLabel>
                    <Toggle value={votingEnabled as boolean} onChange={this.toggleVotingEnabled} />
                  </ToggleRow>
                </StyledSectionField>
                {votingEnabled &&
                  <SectionField>
                    <Label>
                      <FormattedMessage {...messages.votingMethod} />
                    </Label>
                    <Radio
                      onChange={this.handeVotingMethodOnChange}
                      currentValue={votingMethod}
                      value="unlimited"
                      name="votingmethod"
                      id="votingmethod-unlimited"
                      label={<FormattedMessage {...messages.unlimited} />}
                    />
                    <Radio
                      onChange={this.handeVotingMethodOnChange}
                      currentValue={votingMethod}
                      value="limited"
                      name="votingmethod"
                      id="votingmethod-limited"
                      label={<FormattedMessage {...messages.limited} />}
                    />
                    {votingLimitSection}
                    <Error text={noVotingLimit} />
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
                      currentValue={presentationMode}
                      value={key}
                      name="presentation_mode"
                      id={`presentation_mode-${key}`}
                      label={<FormattedMessage {...messages[`${key}Display`]} />}
                    />
                  ))}
                </SectionField>
              </>
            }

            {participationMethod === 'survey' &&
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
