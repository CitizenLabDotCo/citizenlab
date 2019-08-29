import React, { PureComponent } from 'react';
import { addOfficialFeedbackToIdea, addOfficialFeedbackToInitiative } from 'services/officialFeedback';
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
  postId: string;
  postType: 'idea' | 'initiative';
  className?: string;
}

interface State {}

export default class OfficialFeedbackNew extends PureComponent<Props, State> {
  handleSubmit = async (values: FormValues, { setErrors, setSubmitting, setStatus, resetForm }) => {
    const formattedMentionsBodyMultiloc = formatMentionsBodyMultiloc(values.body_multiloc);
    const { postId, postType } = this.props;
    const feedbackValues = {
      ...(values || {}),
      body_multiloc: formattedMentionsBodyMultiloc
    };

    setSubmitting(true);

    try {
      if (postType === 'idea') {
        await addOfficialFeedbackToIdea(postId, feedbackValues);
      } else if (postType === 'initiative') {
        await addOfficialFeedbackToInitiative(postId, feedbackValues);
      }

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
    if (postType === 'idea') {
      trackEventByName(tracks.officialFeedbackGiven, { location: isAdminPage(location.pathname) ? 'Admin/idea manager' : 'Citizen/idea page' });
    } else if (postType === 'initiative') {
      trackEventByName(tracks.officialFeedbackGiven, { location: isAdminPage(location.pathname) ? 'Admin/initiative manager' : 'Citizen/initiative page' });
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
