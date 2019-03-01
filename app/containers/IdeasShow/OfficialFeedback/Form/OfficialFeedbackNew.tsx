import React, { PureComponent } from 'react';
import { addOfficialFeedbackToIdea } from 'services/officialFeedback';
import { Formik } from 'formik';
import OfficialFeedbackForm, { FormValues } from './OfficialFeedbackForm';
import { CLErrorsJSON } from 'typings';

interface Props {
  ideaId: string;
  className?: string;
  // newCommentPosted: () => void;
}

interface State {}

export default class OfficialFeedbackNew extends PureComponent<Props, State> {
  handleSubmit = async (values: FormValues, { setErrors, setSubmitting, resetForm }) => {
    const { ideaId } = this.props;

    setSubmitting(true);

    try {
      await addOfficialFeedbackToIdea(ideaId, values);
      setSubmitting(false);
      resetForm();
    } catch (errorResponse) {
      const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
      setErrors(apiErrors);
      setSubmitting(false);
    }
  }

  renderFn = (props) => {
    return <OfficialFeedbackForm {...props} />;
  }

  initialValues = () => ({
    author_multiloc: {},
    body_multiloc: {}
  });

  render() {
    return (
      <div className={this.props.className} >
        <Formik
          initialValues={this.initialValues()}
          render={this.renderFn}
          onSubmit={this.handleSubmit}
          validate={OfficialFeedbackForm.validate}
        />
      </div>
    );
  }
}
