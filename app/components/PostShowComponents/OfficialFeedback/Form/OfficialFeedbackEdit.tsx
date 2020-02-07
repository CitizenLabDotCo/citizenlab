import React from 'react';

import { updateOfficialFeedback, IOfficialFeedbackData } from 'services/officialFeedback';

import { Formik } from 'formik';
import OfficialFeedbackForm, { OfficialFeedbackFormValues } from './OfficialFeedbackForm';
import { CLErrorsJSON } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';

interface Props {
  feedback: IOfficialFeedbackData;
  closeForm: () => void;
  className?: string;
}

export default class OfficialFeedbackEdit extends React.Component<Props> {

  handleOnChange = (formValues: OfficialFeedbackFormValues) => {
    this.setState({ formValues });
  }

  handleSubmit = (formValues: OfficialFeedbackFormValues) => {
    // const { feedback: { id }, closeForm } = this.props;
    // setSubmitting(true);
    // updateOfficialFeedback(id, values)
    //   .then(() => {
    //     setSubmitting(false);
    //     closeForm();
    //   }).catch((errorResponse) => {
    //     if (isCLErrorJSON(errorResponse)) {
    //       const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
    //       setErrors(apiErrors);
    //     } else {
    //       setStatus('error');
    //     }
    //     setSubmitting(false);
    //   });
  }

  renderFn = (props) => {
    return <OfficialFeedbackForm {...props} editForm onCancel={this.props.closeForm}/>;
  }

  initialValues = () => ({
    author_multiloc: this.props.feedback.attributes.author_multiloc,
    body_multiloc: this.props.feedback.attributes.body_multiloc
  })

  render() {
    return null;

    // return (
      <Container className={className} >
        <OfficialFeedbackForm
          formValues={formValues}
          onSubmit={this.handleOnChange}
          onChange={this.handleOnSubmit}
          editForm={false}
          processing={processing}
        />
      </Container>
    // );
  }
}
