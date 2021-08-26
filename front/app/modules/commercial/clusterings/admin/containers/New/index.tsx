import React, { PureComponent } from 'react';
import clHistory from 'utils/cl-router/history';
import { addClustering } from '../../../services/clusterings';
import { Formik, FormikErrors } from 'formik';
import ClusteringForm, { FormValues } from './ClusteringForm';
import { CLErrorsJSON } from 'typings';
import { isEmpty, values as getValues, every } from 'lodash-es';
import { isCLErrorJSON } from 'utils/errorUtils';

interface Props {}

export default class New extends PureComponent<Props> {
  validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = [{ error: 'blank' }] as any;
    }
    return errors;
  };
  handleSubmit = (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    addClustering({
      ...values,
    })
      .then((clustering) => {
        clHistory.push(`/admin/dashboard/insights/${clustering.data.id}`);
      })
      .catch((errorResponse) => {
        if (isCLErrorJSON(errorResponse)) {
          const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
          setErrors(apiErrors);
        } else {
          setStatus('error');
        }
        setSubmitting(false);
      });
  };

  renderFn = (props) => {
    return <ClusteringForm {...props} />;
  };

  initialValues = (): FormValues => ({
    title_multiloc: {},
    levels: ['project', 'topic'],
    drop_empty: true,
    projects: [],
    topics: [],
    areas: [],
    idea_statuses: [],
  });

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
