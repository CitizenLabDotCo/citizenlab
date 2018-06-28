import React, { PureComponent } from 'react';
import { browserHistory } from 'react-router';
import { addClustering } from 'services/clusterings';
import { Formik, FormikErrors } from 'formik';
import ClusteringForm, { FormValues } from './ClusteringForm';
import { API } from 'typings';
import { isEmpty, values as getValues, every } from 'lodash';

type Props = {};

export default class New extends PureComponent<Props> {

  validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = (errors.title_multiloc || []).concat({ error: 'blank' });
    }
    return errors;
  }
  handleSubmit = (values: FormValues, { setErrors, setSubmitting }) => {
    addClustering({
      ...values
    })
      .then((clustering) => {
        browserHistory.push(`/admin/clusterings/${clustering.data.id}`);
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

  initialValues = (): FormValues => ({
    title_multiloc: {},
    levels: ['project', 'topic'],
    drop_empty: true,
    projects: [],
    topics: [],
    areas: [],
    idea_statuses: [],
  })

  render() {
    return (
      <Formik
        initialValues={this.initialValues()}
        render={this.renderFn}
        onSubmit={this.handleSubmit}
        validate={this.validate}
      />
    );
  }
}
