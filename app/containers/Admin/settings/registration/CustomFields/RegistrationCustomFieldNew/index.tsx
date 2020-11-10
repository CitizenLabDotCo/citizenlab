import React from 'react';
import styled from 'styled-components';
import { addCustomFieldForUsers } from 'services/userCustomFields';
import { CLErrorsJSON } from 'typings';
import clHistory from 'utils/cl-router/history';

import GoBackButton from 'components/UI/GoBackButton';
import PageWrapper from 'components/admin/PageWrapper';
import RegistrationCustomFieldForm, {
  FormValues,
} from '../RegistrationCustomFieldForm';
import { Formik } from 'formik';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { isCLErrorJSON } from 'utils/errorUtils';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

type Props = {};

class RegistrationCustomFieldNew extends React.Component<Props> {
  handleSubmit = (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    addCustomFieldForUsers({
      ...values,
    })
      .then((response) => {
        if (this.hasOptions(values.input_type)) {
          clHistory.push(
            `/admin/settings/registration/custom-fields/${response.data.id}/options`
          );
        } else {
          clHistory.push('/admin/settings/registration');
        }
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

  renderFn = (props) => (
    <RegistrationCustomFieldForm {...props} mode="new" builtInField={false} />
  );

  hasOptions = (inputType) => {
    return inputType === 'select' || inputType === 'multiselect';
  };

  goBack = () => {
    clHistory.push('/admin/settings/registration');
  };

  render() {
    return (
      <div>
        <GoBackButton onClick={this.goBack} />
        <PageTitle>
          <FormattedMessage {...messages.addANewRegistrationField} />
        </PageTitle>
        <PageWrapper>
          <Formik
            initialValues={{
              input_type: 'text',
              title_multiloc: {},
              description_multiloc: {},
              required: false,
              enabled: true,
            }}
            onSubmit={this.handleSubmit}
            render={this.renderFn}
            validate={RegistrationCustomFieldForm['validate']}
          />
        </PageWrapper>
      </div>
    );
  }
}

export default RegistrationCustomFieldNew;
