import React, { PureComponent } from 'react';
import { get, keys, isEqual, pick } from 'lodash-es';
import { adopt } from 'react-adopt';
import { Formik } from 'formik';
import { Multiloc } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

// services
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import { updateTenant } from 'services/tenant';

// components
import InitiativesSettingsForm, { FormValues } from './InitiativesSettingsForm';
import { SectionTitle } from 'components/admin/Section';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface DataProps {
  tenant: GetTenantChildProps;
}

interface State {
  initiativesEnabled: boolean;
}

interface IInitiativeSettingsFormValues {
  days_limit: number;
  eligibility_criteria: Multiloc;
  threshold_reached_message: Multiloc;
  voting_threshold: number;
  enabled: boolean;
}

class InitiativesSettingsPage extends PureComponent<DataProps, State> {

  constructor (props) {
    super(props);
    this.state = {
      initiativesEnabled: false
    };
  }

  initialValues = () => {
    const { tenant } = this.props;
    const initiativesSettings = !isNilOrError(tenant) ? tenant.attributes.settings.initiatives : null;

    if (initiativesSettings) {
      const { days_limit, eligibility_criteria, threshold_reached_message, voting_threshold, enabled } = initiativesSettings;
      const initialFormValues: IInitiativeSettingsFormValues = {
        days_limit,
        eligibility_criteria,
        threshold_reached_message,
        voting_threshold,
        enabled
      };

      return initialFormValues;
    }

    return null;
  }

  changedValues = (initialValues, newValues) => {
    const changedKeys = keys(newValues).filter((key) => (
      !isEqual(initialValues[key], newValues[key])
    ));
    return pick(newValues, changedKeys);
  }

  handleSubmit = (values: FormValues, { setErrors, setSubmitting, setStatus, resetForm }) => {
    const { tenant } = this.props;

    if (isNilOrError(tenant)) return;

    updateTenant(tenant.id, {
      settings: {
        initiatives: {
          ...this.changedValues(this.initialValues(), values)
        } as any
      }
    })
      .then(() => {
        setSubmitting(false);
        resetForm();
        setStatus('success');
      })
      .catch((errorResponse) => {
        const apiErrors = get(errorResponse, 'json.errors');
        apiErrors && setErrors(apiErrors);
        setStatus('error');
        setSubmitting(false);
      });
  }

  renderFn = (props) => (
    !isNilOrError(this.props.tenant) && (
      <InitiativesSettingsForm {...props} />
    )
  )

  toggleInitiatives = () => {

  }

  render() {
    const { tenant } = this.props;

    if (!isNilOrError(tenant)) {
      return (
        <>
          <SectionTitle>
            <FormattedMessage {...messages.titleSettingsTab} />
          </SectionTitle>

          <Formik
            initialValues={this.initialValues()}
            onSubmit={this.handleSubmit}
            render={this.renderFn}
            validate={InitiativesSettingsForm.validate}
          />
        </>
      );
    }
    return null;
  }
}

const Data = adopt<DataProps>({
  tenant: <GetTenant />,
});

const WrappedInitiativesSettingsPage = () => (
  <Data>
    {dataProps => <InitiativesSettingsPage {...dataProps} />}
  </Data>
);

export default WrappedInitiativesSettingsPage;
