import React, { PureComponent } from 'react';
import { isEmpty } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// services
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import { updateTenant } from 'services/tenant';

// components
import { SectionTitle, Section, SectionField } from 'components/admin/Section';
import Button from 'components/UI/Button';
import QuillEditor from 'components/UI/QuillEditor';
import Input from 'components/UI/Input';
import Toggle from 'components/UI/Toggle';
import Warning from 'components/UI/Warning';
import Label from 'components/UI/Label';
import IconTooltip from 'components/UI/IconTooltip';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';

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

const StyledWarning = styled(Warning)`
  margin-bottom: 7px;
`;

const StyledSectionField = styled(SectionField)`
  margin-top: 45px;
`;

const ButtonContainer = styled.div`
  display: flex;
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

interface InputProps {
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
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
  selectedLocale: Locale;
  formValues: FormValues;
  processing: boolean;
  error: boolean;
  success: boolean;
}

class InitiativesSettingsPage extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedLocale: null as any,
      formValues: null as any,
      processing: false,
      error: false,
      success: false
    };
  }

  componentDidMount() {
    const { locale, tenant } = this.props;

    if (!isNilOrError(locale) && !isNilOrError(tenant) && tenant?.attributes?.settings?.initiatives) {
      const initiativesSettings = tenant.attributes.settings.initiatives;

      this.setState({
        selectedLocale: locale,
        formValues: {
          days_limit: initiativesSettings.days_limit,
          eligibility_criteria: initiativesSettings.eligibility_criteria,
          threshold_reached_message: initiativesSettings.threshold_reached_message,
          voting_threshold: initiativesSettings.voting_threshold,
          enabled: initiativesSettings.enabled
        }
      });
    }
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (prevState.formValues !== this.state.formValues && (this.state.error || this.state.success)) {
      this.setState({
        success: false,
        error: false
      });
    }
  }

  validate = () => {
    const { tenant } = this.props;
    const { formValues } = this.state;
    const tenantLocales = !isNilOrError(tenant) ? tenant.attributes.settings.core.locales : null;
    let validated = false;

    if (tenantLocales) {
      validated = true;

      tenantLocales.forEach((locale) => {
        if (isEmpty(formValues.eligibility_criteria[locale]) || isEmpty(formValues.threshold_reached_message[locale])) {
          validated = false;
        }
      });
    }

    return validated;
  }

  handleSubmit = async () => {
    const { tenant } = this.props;
    const { formValues, processing } = this.state;

    if (!isNilOrError(tenant) && !isEmpty(formValues) && !processing && this.validate()) {
      this.setState({ processing: true });

      try {
        await updateTenant(tenant.id, {
          settings: {
            initiatives: formValues
          }
        });

        this.setState({
          processing: false,
          success: true,
          error: false
        });
      } catch {
        this.setState({
          processing: true,
          error: true
        });
      }
    }
  }

  handleEnabledOnChange = (event: React.FormEvent) => {
    event.preventDefault();

    this.setState(({ formValues }) => ({
      formValues: {
        ...formValues,
        enabled: !formValues.enabled
      }
    }));
  }

  handleVotingTresholdOnChange = (value: string) => {
    this.setState(({ formValues }) => ({
      formValues: {
        ...formValues,
        voting_threshold: parseInt(value, 10)
      }
    }));
  }

  handleDaysLimitOnChange = (value: string) => {
    this.setState(({ formValues }) => ({
      formValues: {
        ...formValues,
        days_limit: parseInt(value, 10)
      }
    }));
  }

  handleSelectedLocaleOnChange = (selectedLocale: Locale) => {
    this.setState({ selectedLocale });
  }

  handleEligibilityCriteriaOnChange = (value: string, locale: Locale | undefined) => {
    if (locale) {
      this.setState(({ formValues }) => ({
        formValues: {
          ...formValues,
          eligibility_criteria: {
            ...formValues.eligibility_criteria,
            [locale]: value
          }
        }
      }));
    }
  }

  handleThresholdReachedMessageOnChange = (value: string, locale: Locale | undefined) => {
    if (locale) {
      this.setState(({ formValues }) => ({
        formValues: {
          ...formValues,
          threshold_reached_message: {
            ...formValues.threshold_reached_message,
            [locale]: value
          }
        }
      }));
    }
  }

  render() {
    const { locale, tenant, className } = this.props;
    const { selectedLocale, formValues, processing, error, success } = this.state;

    if (!isNilOrError(locale) && !isNilOrError(tenant) && formValues) {

      console.log(formValues);

      return (
        <Container className={className || ''}>
          <SectionTitle>
            <FormattedMessage {...messages.titleSettingsTab} />
          </SectionTitle>

          <Section>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldEnable} />
              </Label>
              <Toggle
                value={formValues.enabled}
                onChange={this.handleEnabledOnChange}
              />
            </SectionField>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldVotingThreshold} />
              </Label>
              <StyledWarning>
                <FormattedMessage {...messages.warningTresholdSettings}/>
              </StyledWarning>
              <Input
                className="e2e-voting-threshold"
                name="voting_threshold"
                type="number"
                value={formValues.voting_threshold.toString()}
                onChange={this.handleVotingTresholdOnChange}
              />
            </SectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldDaysLimit} />
              </Label>
              <StyledWarning>
                <FormattedMessage {...messages.warningTresholdSettings}/>
              </StyledWarning>
              <Input
                className="e2e-days-limit"
                name="days_limit"
                type="number"
                value={formValues.days_limit.toString()}
                onChange={this.handleDaysLimitOnChange}
              />
            </SectionField>

            <FormLocaleSwitcher
              locales={tenant.attributes.settings.core.locales}
              selectedLocale={selectedLocale}
              onLocaleChange={this.handleSelectedLocaleOnChange}
              values={{
                eligibility_criteria: formValues.eligibility_criteria,
                threshold_reached_message: formValues.threshold_reached_message
              }}
            />

            <StyledSectionField>
              <QuillEditor
                id="threshold_reached_message"
                value={formValues.threshold_reached_message[selectedLocale]}
                onChange={this.handleThresholdReachedMessageOnChange}
                locale={selectedLocale}
                label={<FormattedMessage {...messages.fieldThresholdReachedMessage} />}
                labelTooltip={<IconTooltip content={<FormattedMessage {...messages.fieldThresholdReachedMessageInfo} />} />}
                noImages={true}
                noVideos={true}
                noAlign={true}
                limitedTextFormatting={true}
              />
            </StyledSectionField>
            <SectionField>
              <QuillEditor
                id="eligibility_criteria"
                value={formValues.eligibility_criteria[selectedLocale]}
                onChange={this.handleEligibilityCriteriaOnChange}
                locale={selectedLocale}
                label={<FormattedMessage {...messages.fieldEligibilityCriteria} />}
                labelTooltip={<IconTooltip content={<FormattedMessage {...messages.fieldEligibilityCriteriaInfo} />} />}
                noImages={true}
                noVideos={true}
                noAlign={true}
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
              {success
                ? <FormattedMessage {...messages.initiativeSettingsFormSaved} />
                : <FormattedMessage {...messages.initiativeSettingsFormSave} />
              }
            </Button>

            {error &&
              <ErrorMessage>
                <FormattedMessage {...messages.initiativeSettingsFormError} />
              </ErrorMessage>
            }

            {success &&
              <SuccessMessage>
                <FormattedMessage {...messages.initiativeSettingsFormSuccess} />
              </SuccessMessage>
            }
          </ButtonContainer>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />
});

const InitiativesSettingsPageWithHoC = injectIntl<Props>(InitiativesSettingsPage);

const WrappedInitiativesSettingsPage = () => (
  <Data>
    {dataProps => <InitiativesSettingsPageWithHoC {...dataProps} />}
  </Data>
);

export default WrappedInitiativesSettingsPage;
