import React from 'react';

import { updateOfficialFeedback, IOfficialFeedbackData } from 'services/officialFeedback';

import { Formik } from 'formik';
import OfficialFeedbackForm, { FormValues } from './OfficialFeedbackForm';
import { CLErrorsJSON } from 'typings';

interface Props {
  feedback: IOfficialFeedbackData;
  closeForm: () => void;
}

export default class OfficialFeedbackEdit extends React.Component<Props> {

  handleSubmit = (values: FormValues, { setErrors, setSubmitting }) => {
    const { feedback: { id }, closeForm } = this.props;
    setSubmitting(true);
    updateOfficialFeedback(id, values)
      .then(() => {
        setSubmitting(false);
        closeForm();
      }).catch((errorResponse) => {

        const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }

  renderFn = (props) => {
    return <OfficialFeedbackForm {...props} onCancel={this.props.closeForm}/>;
  }

  initialValues = () => ({
    author_multiloc: this.props.feedback.attributes.author_multiloc,
    body_multiloc: this.props.feedback.attributes.body_multiloc
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
