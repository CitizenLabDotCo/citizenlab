import React, { PureComponent } from 'react';
import { addOfficialFeedbackToIdea, addOfficialFeedbackToInitiative } from 'services/officialFeedback';
import { Formik } from 'formik';
import OfficialFeedbackForm, { FormValues, formatMentionsBodyMultiloc } from './OfficialFeedbackForm';
import { CLErrorsJSON } from 'typings';
import { adopt } from 'react-adopt';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// utils
import { isPage, isNilOrError } from 'utils/helperUtils';
import { isCLErrorJSON } from 'utils/errorUtils';

interface DataProps {
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps {}

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  className?: string;
}

interface State {}

class OfficialFeedbackNew extends PureComponent<Props, State> {
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
      trackEventByName(tracks.officialFeedbackGiven, { location: isPage('admin', location.pathname) ? 'Admin/idea manager' : 'Citizen/idea page' });
    } else if (postType === 'initiative') {
      trackEventByName(tracks.officialFeedbackGiven, { location: isPage('admin', location.pathname) ? 'Admin/initiative manager' : 'Citizen/initiative page' });
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
    if (!isNilOrError(this.props.tenant)) {
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

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <OfficialFeedbackNew {...inputProps} {...dataProps} />}
  </Data>
);
