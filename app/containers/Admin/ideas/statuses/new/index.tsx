import React from 'react';
import styled from 'styled-components';
import { addIdeaStatus } from 'services/ideaStatuses';
import { CLErrorsJSON } from 'typings';
import clHistory from 'utils/cl-router/history';

import GoBackButton from 'components/UI/GoBackButton';
import IdeaStatusForm, { FormValues } from '../IdeaStatusForm';
import { Formik } from 'formik';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { isCLErrorJSON } from 'utils/errorUtils';

const FormHeader = styled.div`
  width: 100%;
  margin: 0 0 3rem;
`;

const FormTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

type Props = {};

class New extends React.Component<Props> {
  handleSubmit = (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    addIdeaStatus({
      ...values,
    })
      .then((_response) => {
        clHistory.push('/admin/ideas/statuses');
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
    <IdeaStatusForm {...props} mode="new" builtInField={false} />
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
        <FormHeader>
          <GoBackButton onClick={this.goBack} />
          <FormTitle>
            <FormattedMessage {...messages.addIdeaStatus} />
          </FormTitle>
        </FormHeader>
        <Formik
          initialValues={{
            color: '#b5b5b5',
            title_multiloc: {},
            description_multiloc: {},
            code: '',
          }}
          onSubmit={this.handleSubmit}
          render={this.renderFn}
          validate={IdeaStatusForm['validate']}
        />
      </div>
    );
  }
}

export default New;
