import React from 'react';
import clHistory from 'utils/cl-router/history';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';

import { addArea } from 'services/areas';

import { Formik } from 'formik';
import AreaForm, { FormValues } from '../AreaForm';

import { CLErrorsJSON } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

export default class New extends React.Component<Props> {
  handleSubmit = (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    addArea({
      ...values,
    })
      .then(() => {
        clHistory.push('/admin/settings/areas');
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
    return <AreaForm {...props} />;
  };

  goBack = () => {
    clHistory.push('/admin/settings/areas');
  };

  initialValues = () => ({
    title_multiloc: {},
    description_multiloc: {},
  });

  render() {
    return (
      <Section>
        <GoBackButton onClick={this.goBack} />
        <SectionTitle>
          <FormattedMessage {...messages.addAreaButton} />
        </SectionTitle>
        <Formik
          initialValues={this.initialValues()}
          render={this.renderFn}
          onSubmit={this.handleSubmit}
        />
      </Section>
    );
  }
}
