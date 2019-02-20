import React from 'react';

import { addOfficialFeedbackToIdea } from 'services/officialFeedback';

import { Formik } from 'formik';
import OfficialFeedbackForm, { FormValues } from './';
import { CLErrorsJSON } from 'typings';

interface Props {
  ideaId: string;
}

export default class OfficialFeedbackNew extends React.Component<Props> {

  handleSubmit = (values: FormValues, { setErrors, setSubmitting, resetForm }) => {
    const { ideaId } = this.props;
    setSubmitting(true);
    addOfficialFeedbackToIdea(ideaId, values)
      .then(() => {
        setSubmitting(false);
        resetForm();
      }).catch((errorResponse) => {

        const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }

  renderFn = (props) => {
    return <OfficialFeedbackForm {...props} />;
  }

  initialValues = () => ({
    author_multiloc: {},
    body_multiloc: {}
  })

  render() {
    return (
        <Formik
          initialValues={this.initialValues()}
          render={this.renderFn}
          onSubmit={this.handleSubmit}
          validate={OfficialFeedbackForm.validate}
        />
    );
  }
}
