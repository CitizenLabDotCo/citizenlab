import React, { PureComponent } from 'react';
import { addOfficialFeedbackToIdea } from 'services/officialFeedback';
import { Formik } from 'formik';
import OfficialFeedbackForm, { FormValues, formatMentionsBodyMultiloc } from './OfficialFeedbackForm';
import { CLErrorsJSON } from 'typings';

interface Props {
  ideaId: string;
  className?: string;
}

interface State {}

export default class OfficialFeedbackNew extends PureComponent<Props, State> {
  handleSubmit = async (values: FormValues, { setErrors, setSubmitting, setStatus, resetForm }) => {
    const formattedMentionsBodyMultiloc = formatMentionsBodyMultiloc(values.body_multiloc);
    const { ideaId } = this.props;
    const feedbackValues = { ...values, ...{ body_multiloc: formattedMentionsBodyMultiloc } };

    setSubmitting(true);

    try {
      await addOfficialFeedbackToIdea(ideaId, feedbackValues);
      setSubmitting(false);
      resetForm();
      setStatus('success');
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
  })

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
