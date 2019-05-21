import React, { PureComponent } from 'react';
import { get, keys, isEqual, pick, omit } from 'lodash-es';
import { adopt } from 'react-adopt';
import { Formik } from 'formik';

import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import { isNilOrError } from 'utils/helperUtils';
import { updateTenant } from 'services/tenant';

import InitiativesSettingsForm, { FormValues } from './InitiativesSettingsForm';
import { SectionTitle, SectionSubtitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface DataProps {
  tenant: GetTenantChildProps;
}

class InitiativesSettingsPage extends PureComponent<DataProps> {

    initialValues = () => {
      const initiativesSettings = get(this.props.tenant, 'attributes.settings.initiatives');
      // TODO don't omit enabled (i3)
      if (initiativesSettings) return omit(initiativesSettings, ['enabled', 'allowed', 'success_stories']);
      return null;
    }

    changedValues = (initialValues, newValues) => {
      const changedKeys = keys(newValues).filter((key) => (
        !isEqual(initialValues[key], newValues[key])
      ));
      return pick(newValues, changedKeys);
    }

    handleSubmit = (values: FormValues, { setErrors, setSubmitting, setStatus }) => {
      const { tenant } = this.props;
      if (isNilOrError(tenant)) return;

      updateTenant(tenant.id, {
        settings: {
          initiatives: {
            ...this.changedValues(this.initialValues(), values)
          }
        }
      })
        .then(() => {
          setSubmitting(false);
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
          <SectionSubtitle>
            <FormattedMessage {...messages.subtitleSettingsTab} />
          </SectionSubtitle>

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
