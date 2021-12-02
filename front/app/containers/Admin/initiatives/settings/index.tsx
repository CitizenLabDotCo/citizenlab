import React, { PureComponent } from 'react';
import { isEmpty, isNaN } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// services
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import { updateAppConfiguration } from 'services/appConfiguration';
import { toggleProposals } from 'services/navbar';

// components
import {
  SectionTitle,
  SectionDescription,
  Section,
} from 'components/admin/Section';
import Warning from 'components/UI/Warning';
import EnableSwitch from './EnableSwitch';
import VotingThreshold from './VotingThreshold';
import VotingLimit from './VotingLimit';
import ThresholdReachedMessage from './ThresholdReachedMessage';
import EligibilityCriteria from './EligibilityCriteria';
import SubmitButton from './SubmitButton';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// styling
import styled from 'styled-components';

// typings
import { Multiloc } from 'typings';

const Container = styled.div``;

export const StyledWarning = styled(Warning)`
  margin-bottom: 7px;
`;

export const StyledSectionDescription = styled(SectionDescription)`
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

export interface FieldProps {
  formValues: FormValues;
  setParentState: (state: any) => void;
}

interface FormValues {
  days_limit: number;
  eligibility_criteria: Multiloc;
  threshold_reached_message: Multiloc;
  voting_threshold: number;
}

interface State {
  formValues: FormValues | null;
  updateProposalsInNavbar: boolean | null;
  touched: boolean;
  processing: boolean;
  error: boolean;
  success: boolean;
}

class InitiativesSettingsPage extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      formValues: null,
      updateProposalsInNavbar: null,
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
        },
      });
    }
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    const formValuesChanged =
      prevState.formValues &&
      this.state.formValues &&
      prevState.formValues !== this.state.formValues;

    const proposalsNavbarItemChanged =
      this.state.updateProposalsInNavbar !== null;

    if (formValuesChanged || proposalsNavbarItemChanged) {
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

    if (!formValues) return false;

    const proposalsSettingsChanged = !isEmpty(formValues);
    const proposalsNavbarItemChanged =
      this.state.updateProposalsInNavbar !== null;
    const formChanged = proposalsSettingsChanged || proposalsNavbarItemChanged;

    if (touched && !processing && tenantLocales && formChanged) {
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

    if (!formValues) return;

    if (!isNilOrError(tenant) && this.validate()) {
      this.setState({ processing: true });

      try {
        await updateAppConfiguration({
          settings: {
            initiatives: formValues,
          },
        });

        const { updateProposalsInNavbar } = this.state;

        if (updateProposalsInNavbar !== null) {
          await toggleProposals({ enabled: updateProposalsInNavbar });
        }

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

  render() {
    const { locale, tenant, className } = this.props;
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
            <EnableSwitch setParentState={this.setState} />

            <VotingThreshold
              formValues={formValues}
              setParentState={this.setState}
            />

            <VotingLimit
              formValues={formValues}
              setParentState={this.setState}
            />

            <ThresholdReachedMessage
              formValues={formValues}
              setParentState={this.setState}
            />

            <EligibilityCriteria
              formValues={formValues}
              setParentState={this.setState}
            />
          </Section>

          <SubmitButton
            disabled={!this.validate()}
            processing={processing}
            error={error}
            success={success}
            handleSubmit={this.handleSubmit}
          />
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

const WrappedInitiativesSettingsPage = () => (
  <Data>{(dataProps) => <InitiativesSettingsPage {...dataProps} />}</Data>
);

export default WrappedInitiativesSettingsPage;
