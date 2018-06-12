import React from 'react';
import { browserHistory } from 'react-router';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import { Section, SectionTitle } from 'components/admin/Section';

import { addClustering } from 'services/clusterings';

import { Formik } from 'formik';
import ClusteringForm, { FormValues } from './ClusteringForm';


import { API } from 'typings';
type Props = {};

export default class New extends React.Component<Props> {

  handleSubmit = (values: FormValues, { setErrors, setSubmitting }) => {
    addClustering({
      ...values
    })
      .then(() => {
        browserHistory.push('/admin/clusterings');
      })
      .catch((errorResponse) => {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }


  renderFn = (props) => {
    return <ClusteringForm {...props} />;
  }

  initialValues = () => ({
    title_multiloc: {},
    levels: ['project', 'topic'],
  })

  render() {
    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.addClusteringButton} />
        </SectionTitle>
        <Formik
          initialValues={this.initialValues()}
          render={this.renderFn}
          onSubmit={this.handleSubmit}
          validate={ClusteringForm.validate}
        />
      </Section>
    );
  }
}
