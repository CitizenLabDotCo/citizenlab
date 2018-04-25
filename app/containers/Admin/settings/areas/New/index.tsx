import React from 'react';
import { browserHistory } from 'react-router';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import { Section, SectionTitle } from 'components/admin/Section';

import { addArea } from 'services/areas';

import { Formik } from 'formik';
import AreaForm, { FormValues } from '../AreaForm';


import { API } from 'typings';
type Props = {};

export default class New extends React.Component<Props> {

  handleSubmit = (values: FormValues, { setErrors, setSubmitting }) => {
    addArea({
      ...values
    })
      .then(() => {
        browserHistory.push('/admin/settings/areas');
      })
      .catch((errorResponse) => {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }


  renderFn = (props) => {
    return <AreaForm {...props} />;
  }

  initialValues = () => ({
    title_multiloc: {},
    description_multiloc: {}
  })

  render() {
    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.addAreaButton} />
        </SectionTitle>
          <Formik
            initialValues={this.initialValues()}
            render={this.renderFn}
            onSubmit={this.handleSubmit}
            validate={AreaForm.validate}
          />
      </Section>
    );
  }
}
