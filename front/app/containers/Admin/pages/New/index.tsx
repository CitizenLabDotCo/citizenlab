import React from 'react';
import styled from 'styled-components';
import { CLErrorsJSON } from 'typings';
import clHistory from 'utils/cl-router/history';

import GoBackButton from 'components/UI/GoBackButton';
import PageWrapper from 'components/admin/PageWrapper';
import PageForm from 'components/PageForm';
import { Formik } from 'formik';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { createPage } from 'services/pages';
import { isCLErrorJSON } from 'utils/errorUtils';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

class New extends React.Component<Props> {
  // Still need to handle file saving if we'll use this form.
  // Also change typing of values parameter to something different (probably FormValues) than 'any'
  handleSubmit = (values: any, { setErrors, setSubmitting, setStatus }) => {
    createPage({
      ...values,
    })
      .then(() => {
        clHistory.push('/admin/pages');
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

  initialValues = () => {
    return {
      title_multiloc: {},
      body_multiloc: {},
    };
  };

  renderFn = (props) => <PageForm {...props} mode="new" />;

  goBack = () => {
    clHistory.push('/admin/pages');
  };

  render() {
    return (
      <div>
        <GoBackButton onClick={this.goBack} />
        <PageTitle>
          <FormattedMessage {...messages.addPageButton} />
        </PageTitle>
        <PageWrapper>
          <Formik
            initialValues={this.initialValues()}
            onSubmit={this.handleSubmit}
            render={this.renderFn}
            validate={PageForm.validate}
          />
        </PageWrapper>
      </div>
    );
  }
}

export default New;
