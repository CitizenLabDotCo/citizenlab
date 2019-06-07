import React, { PureComponent } from 'react';
import { addOfficialFeedbackToIdea } from 'services/officialFeedback';
import { Formik } from 'formik';
import OfficialFeedbackForm, { FormValues, formatMentionsBodyMultiloc } from './OfficialFeedbackForm';
import { CLErrorsJSON } from 'typings';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// utils
import { isAdminPage } from 'utils/helperUtils';
import { isCLErrorJSON } from 'utils/errorUtils';

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
      if (isCLErrorJSON(errorResponse)) {
        const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
      } else {
        setStatus('error');
      }
      setSubmitting(false);
    }

    // analytics
    trackEventByName(tracks.officialFeedbackGiven, { location: isAdminPage(location.pathname) ? 'Admin/idea manager' : 'Citizen/idea page' });
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
