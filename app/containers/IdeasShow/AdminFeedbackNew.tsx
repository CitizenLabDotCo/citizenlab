import React from 'react';
import clHistory from 'utils/cl-router/history';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';

import { addArea } from 'services/areas';

import { Formik } from 'formik';
import AdminFeedbackForm, { FormValues } from './AdminFeedbackForm';

import { CLErrorsJSON } from 'typings';
type Props = {};

export default class AdminFeedbackNew extends React.Component<Props> {

  handleSubmit = (values: FormValues, { setErrors, setSubmitting }) => {

  }

  renderFn = (props) => {
    return <AdminFeedbackForm {...props} />;
  }

  initialValues = () => ({
    author_multiloc: {},
    body_multiloc: {}
  })

  render() {
    return (
      <Section>
        <Formik
          initialValues={this.initialValues()}
          render={this.renderFn}
          onSubmit={this.handleSubmit}
          validate={AdminFeedbackForm.validate}
        />
      </Section>
    );
  }
}
