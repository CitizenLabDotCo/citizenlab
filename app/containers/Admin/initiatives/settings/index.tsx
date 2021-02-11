import React, { PureComponent } from 'react';
import { isEmpty, isNaN } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// services
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetTenant';
import { updateTenant } from 'services/tenant';

// components
import {
  SectionTitle,
  SectionDescription,
  Section,
  SectionField,
  SubSectionTitle,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import Button from 'components/UI/Button';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import { Toggle, Input } from 'cl2-component-library';
import Warning from 'components/UI/Warning';
import Error from 'components/UI/Error';
import errorMessages from 'components/UI/Error/messages';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';

// stylings
import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

// typings
import { Multiloc, Locale } from 'typings';

const Container = styled.div``;

const StyledToggle = styled(Toggle)`
  margin-right: 10px;
`;

const StyledWarning = styled(Warning)`
  margin-bottom: 7px;
`;

const StyledSectionField = styled(SectionField)`
  margin-top: 45px;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ErrorMessage = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.clRedError};
  font-weight: 400;
  line-height: normal;
  margin-left: 14px;
`;

const SuccessMessage = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.clGreenSuccess};
  font-weight: 400;
  line-height: normal;
  margin-left: 14px;
`;

const StyledSectionDescription = styled(SectionDescription)`
  margin-bottom: 20px;
`;

interface InputProps {
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetAppConfigurationChildProps;
}

interface Props extends InputProps, DataProps {}

interface FormValues {
  days_limit: number;
  eligibility_criteria: Multiloc;
  threshold_reached_message: Multiloc;
  voting_threshold: number;
  enabled: boolean;
}

interface State {
  formValues: FormValues;
  touched: boolean;
  processing: boolean;
  error: boolean;
  success: boolean;
}

class InitiativesSettingsPage extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      formValues: null as any,
      touched: false,
      processing: false,
      error: false,
      success: false,
    };
  }

  componentDidMount() {
    const { locale, tenant } = this.props;

    if (
      !isNilOrError(locale) &&
      !isNilOrError(tenant) &&
      tenant?.attributes?.settings?.initiatives
    ) {
      const initiativesSettings = tenant.attributes.settings.initiatives;

      this.setState({
        formValues: {
          days_limit: initiativesSettings.days_limit,
          eligibility_criteria: initiativesSettings.eligibility_criteria,
          threshold_reached_message:
            initiativesSettings.threshold_reached_message,
          voting_threshold: initiativesSettings.voting_threshold,
          enabled: initiativesSettings.enabled,
        },
      });
    }
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (
      prevState.formValues &&
      this.state.formValues &&
      prevState.formValues !== this.state.formValues
    ) {
      this.setState({
        touched: true,
        processing: false,
        success: false,
        error: false,
      });
    }
  }

  validate = () => {
    const { tenant } = this.props;
    const { touched, processing, formValues } = this.state;
    const tenantLocales = !isNilOrError(tenant)
      ? tenant.attributes.settings.core.locales
      : null;
    let validated = false;

    if (touched && !processing && tenantLocales && !isEmpty(formValues)) {
      validated = true;

      if (
        isNaN(formValues.voting_threshold) ||
        formValues.voting_threshold < 2 ||
        isNaN(formValues.days_limit) ||
        formValues.days_limit < 1
      ) {
        validated = false;
      }

      tenantLocales.forEach((locale) => {
        if (
          isEmpty(formValues.eligibility_criteria[locale]) ||
          isEmpty(formValues.threshold_reached_message[locale])
        ) {
          validated = false;
        }
      });
    }

    return validated;
  };

  handleSubmit = async () => {
    const { tenant } = this.props;
    const { formValues } = this.state;

    if (!isNilOrError(tenant) && this.validate()) {
      this.setState({ processing: true });

      try {
        await updateTenant(tenant.id, {
          settings: {
            initiatives: formValues,
          },
        });

        this.setState({
          touched: false,
          processing: false,
          success: true,
          error: false,
        });
      } catch (error) {
        this.setState({
          processing: false,
          error: true,
        });
      }
    }
  };

  handleEnabledOnChange = (event: React.FormEvent) => {
    event.preventDefault();

    this.setState(({ formValues }) => {
      const { enabled } = formValues;

      return {
        formValues: {
          ...formValues,
          enabled: !enabled,
        },
      };
    });
  };

  handleVotingTresholdOnChange = (value: string) => {
    this.setState(({ formValues }) => ({
      formValues: {
        ...formValues,
        voting_threshold: parseInt(value, 10),
      },
    }));
  };

  handleDaysLimitOnChange = (value: string) => {
    this.setState(({ formValues }) => ({
      formValues: {
        ...formValues,
        days_limit: parseInt(value, 10),
      },
    }));
  };

  handleEligibilityCriteriaOnChange = (
    valueMultiloc: Multiloc,
    locale: Locale | undefined
  ) => {
    if (locale) {
      this.setState(({ formValues }) => ({
        formValues: {
          ...formValues,
          eligibility_criteria: valueMultiloc,
        },
      }));
    }
  };

  handleThresholdReachedMessageOnChange = (
    valueMultiloc: Multiloc,
    locale: Locale | undefined
  ) => {
    if (locale) {
      this.setState(({ formValues }) => ({
        formValues: {
          ...formValues,
          threshold_reached_message: valueMultiloc,
        },
      }));
    }
  };

  render() {
    const { locale, tenant, className, intl } = this.props;
    const { formValues, processing, error, success } = this.state;

    if (!isNilOrError(locale) && !isNilOrError(tenant) && formValues) {
      return (
        <Container className={className || ''}>
          <SectionTitle>
            <FormattedMessage {...messages.settingsTabTitle} />
          </SectionTitle>
          <SectionDescription>
            <FormattedMessage {...messages.settingsTabSubtitle} />
          </SectionDescription>

          <Section>
            <SectionField>
              <SubSectionTitleWithDescription>
                <FormattedMessage {...messages.showProposalEnabled} />
              </SubSectionTitleWithDescription>
              <StyledSectionDescription>
                <FormattedMessage {...messages.showProposalEnabledInfo} />
              </StyledSectionDescription>
              <StyledToggle
                checked={formValues.enabled}
                onChange={this.handleEnabledOnChange}
                label={<FormattedMessage {...messages.enabledToggle} />}
              />
            </SectionField>
            <SectionField>
              <SubSectionTitle>
                <FormattedMessage {...messages.fieldVotingThreshold} />
              </SubSectionTitle>
              <StyledWarning>
                <FormattedMessage {...messages.warningTresholdSettings} />
              </StyledWarning>
              <Input
                className="e2e-voting-threshold"
                name="voting_threshold"
                type="number"
                min="2"
                required={true}
                value={formValues.voting_threshold.toString()}
                onChange={this.handleVotingTresholdOnChange}
              />

              {isNaN(formValues.voting_threshold) && (
                <Error text={intl.formatMessage(errorMessages.blank)} />
              )}

              {!isNaN(formValues.voting_threshold) &&
                formValues.voting_threshold < 2 && (
                  <Error
                    text={intl.formatMessage(
                      messages.initiativeSettingsVotingThresholdError
                    )}
                  />
                )}
            </SectionField>

            <SectionField>
              <SubSectionTitle>
                <FormattedMessage {...messages.fieldVotingDaysLimit} />
              </SubSectionTitle>
              <StyledWarning>
                <FormattedMessage {...messages.warningTresholdSettings} />
              </StyledWarning>
              <Input
                className="e2e-days-limit"
                name="days_limit"
                type="number"
                min="1"
                required={true}
                value={formValues.days_limit.toString()}
                onChange={this.handleDaysLimitOnChange}
              />
              {isNaN(formValues.days_limit) && (
                <Error text={intl.formatMessage(errorMessages.blank)} />
              )}
            </SectionField>

            <StyledSectionField>
              <SubSectionTitleWithDescription>
                <FormattedMessage {...messages.proposalSuccessMessage} />
              </SubSectionTitleWithDescription>
              <StyledSectionDescription>
                <FormattedMessage {...messages.proposalSuccessMessageInfo} />
              </StyledSectionDescription>
              <QuillMultilocWithLocaleSwitcher
                id="threshold_reached_message"
                valueMultiloc={formValues.threshold_reached_message}
                onChange={this.handleThresholdReachedMessageOnChange}
                noImages={true}
                noVideos={true}
                noAlign={true}
                limitedTextFormatting={true}
                withCTAButton
              />
            </StyledSectionField>
            <SectionField>
              <SubSectionTitleWithDescription>
                <FormattedMessage {...messages.proposalEligibilityCriteria} />
              </SubSectionTitleWithDescription>
              <StyledSectionDescription>
                <FormattedMessage
                  {...messages.proposalEligibilityCriteriaInfo}
                />
              </StyledSectionDescription>
              <QuillMultilocWithLocaleSwitcher
                id="eligibility_criteria"
                valueMultiloc={formValues.eligibility_criteria}
                onChange={this.handleEligibilityCriteriaOnChange}
                noImages={true}
                noVideos={true}
                noAlign={true}
                withCTAButton
              />
            </SectionField>
          </Section>

          <ButtonContainer>
            <Button
              buttonStyle="admin-dark"
              onClick={this.handleSubmit}
              disabled={!this.validate()}
              processing={processing}
            >
              {success ? (
                <FormattedMessage {...messages.initiativeSettingsFormSaved} />
              ) : (
                <FormattedMessage {...messages.initiativeSettingsFormSave} />
              )}
            </Button>

            {error && (
              <ErrorMessage>
                <FormattedMessage {...messages.initiativeSettingsFormError} />
              </ErrorMessage>
            )}

            {success && (
              <SuccessMessage>
                <FormattedMessage {...messages.initiativeSettingsFormSuccess} />
              </SuccessMessage>
            )}
          </ButtonContainer>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps>({
  locale: <GetLocale />,
  tenant: <GetAppConfiguration />,
});

const InitiativesSettingsPageWithHoC = injectIntl<Props>(
  InitiativesSettingsPage
);

const WrappedInitiativesSettingsPage = () => (
  <Data>
    {(dataProps) => <InitiativesSettingsPageWithHoC {...dataProps} />}
  </Data>
);

export default WrappedInitiativesSettingsPage;
