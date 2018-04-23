import React from 'react';
import styled from 'styled-components';
import { Formik } from 'formik';
import { addArea } from 'services/areas';
import { browserHistory } from 'react-router';
import { API } from 'typings';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import GoBackButton from 'components/UI/GoBackButton';
import PageWrapper from 'components/admin/PageWrapper';
import AreaForm, { FormValues } from '../AreaForm';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

type Props = {}

export default class New extends React.Component<Props> {
  
  handleSubmit = (values: FormValues, { setErrors, setSubmitting }) => {
    addArea({
      ...values
    })
      .then(() => {
        browserHistory.push('/admin/settings/areas');
      })
      .catch((errorResponse) => {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }
 
  goBack = () => {
    browserHistory.push('/admin/settings/areas');
  }

  renderFn = (props) => {
    return <AreaForm {...props} />;
  }

  initialValues = () => ({
    title_multiloc: {},
    description_multiloc: {}
  });

  render() {
    return (
      <>
        <GoBackButton onClick={this.goBack} />
        <PageTitle>
          <FormattedMessage {...messages.addAreaButton} />
        </PageTitle>
        <PageWrapper>
          <Formik 
            initialValues={this.initialValues()}
            render={this.renderFn}
            onSubmit={this.handleSubmit}
            validate={AreaForm.validate}
          />
        </PageWrapper>
      </>
    )
  }
}

