import * as React from 'react';
import styled from 'styled-components';
import { addCustomFieldForUsers } from 'services/userCustomFields';
import { API } from 'typings';
import { browserHistory } from 'react-router';

import GoBackButton from 'components/UI/GoBackButton';
import PageWrapper from 'components/admin/PageWrapper';
import CustomFieldForm, { FormValues } from '../CustomFieldForm';
import { Formik } from 'formik';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';


const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

type Props = {};

class New extends React.Component<Props> {

  handleSubmit = (values: FormValues, { setErrors, setSubmitting }) => {
    addCustomFieldForUsers({
      ...values
    })
      .then(() => {
        browserHistory.push('/admin/custom_fields');
      })
      .catch((errorResponse) => {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }

  initialValues = () => {
    return {
      key: '',
      input_type: 'text',
      title_multiloc: {},
      description_multiloc: {},
      required: false,
    };
  }

  renderFn = (props) => (
    <CustomFieldForm
      {...props}
      mode="new"
    />
  )

  goBack = () => {
    browserHistory.push('/admin/custom_fields');
  }

  render() {
    return (
      <div>
        <GoBackButton onClick={this.goBack} />
        <PageTitle>
          <FormattedMessage {...messages.addCustomFieldButton} />
        </PageTitle>
        <PageWrapper>
          <Formik
            initialValues={this.initialValues()}
            onSubmit={this.handleSubmit}
            render={this.renderFn}
            validate={CustomFieldForm.validate}
          />
        </PageWrapper>
      </div>
    );
  }
}

export default New;
