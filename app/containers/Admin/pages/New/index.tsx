import * as React from 'react';
import styled from 'styled-components';
import { API } from 'typings';
import { browserHistory } from 'react-router';

import GoBackButton from 'components/UI/GoBackButton';
import PageWrapper from 'components/admin/PageWrapper';
import PageForm, { FormValues } from '../Form';
import { Formik } from 'formik';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { createPage } from 'services/pages';


const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

type Props = {};

class New extends React.Component<Props> {

  handleSubmit = (values: FormValues, { setErrors, setSubmitting }) => {
    createPage({
      ...values
    })
      .then(() => {
        browserHistory.push('/admin/pages');
      })
      .catch((errorResponse) => {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }

  initialValues = () => {
    return {
      title_multiloc: {},
      body_multiloc: {},
    };
  }

  renderFn = (props) => (
    <PageForm
      {...props}
      mode="new"
    />
  )

  goBack = () => {
    browserHistory.push('/admin/pages');
  }

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
