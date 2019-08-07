import React, { PureComponent } from 'react';
import { get, keys, isEqual, pick } from 'lodash-es';
import { adopt } from 'react-adopt';
import { Formik } from 'formik';

import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import { isNilOrError } from 'utils/helperUtils';
import { updateTenant } from 'services/tenant';

import InitiativesSettingsForm, { FormValues } from './InitiativesSettingsForm';
import { SectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import { Multiloc } from 'typings';

interface DataProps {
  tenant: GetTenantChildProps;
}

interface IInitiativeSettingsFormValues {
  days_limit: number;
  eligibility_criteria: Multiloc;
  threshold_reached_message: Multiloc;
  voting_threshold: number;
};

class InitiativesSettingsPage extends PureComponent<DataProps> {

  initialValues = () => {
    const { tenant } = this.props;
    const initiativesSettings = !isNilOrError(tenant) ? tenant.attributes.settings.initiatives : null;

    // TODO don't omit enabled (i3)

    if (initiativesSettings) {
      const { days_limit, eligibility_criteria, threshold_reached_message, voting_threshold } = initiativesSettings;
      const initialFormValues: IInitiativeSettingsFormValues = {
        days_limit,
        eligibility_criteria,
        threshold_reached_message,
        voting_threshold
      }

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
