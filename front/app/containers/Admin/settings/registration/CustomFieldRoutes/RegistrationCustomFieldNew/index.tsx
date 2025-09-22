import React from 'react';

import styled from 'styled-components';

import { IUserCustomFieldInputType } from 'api/user_custom_fields/types';
import useAddUserCustomField from 'api/user_custom_fields/useAddUserCustomField';

import PageWrapper from 'components/admin/PageWrapper';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';
import RegistrationCustomFieldForm, {
  FormValues,
} from '../RegistrationCustomFieldForm';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

const RegistrationCustomFieldNew = () => {
  const { mutate: addCustomFieldForUsers } = useAddUserCustomField();
  const hasOptions = (inputType: IUserCustomFieldInputType) => {
    return inputType === 'select' || inputType === 'multiselect';
  };
  const handleSubmit = (values: FormValues) => {
    addCustomFieldForUsers(
      {
        ...values,
      },
      {
        onSuccess: (result) => {
          if (hasOptions(values.input_type)) {
            clHistory.push(
              `/admin/settings/registration/custom-fields/${result.data.id}/options`
            );
          } else {
            clHistory.push('/admin/settings/registration');
          }
        },
      }
    );
  };

  const goBack = () => {
    clHistory.push('/admin/settings/registration');
  };

  return (
    <div>
      <GoBackButton onClick={goBack} />
      <PageTitle>
        <FormattedMessage {...messages.addANewDemographicQuestion} />
      </PageTitle>
      <PageWrapper>
        <RegistrationCustomFieldForm
          mode="new"
          builtInField={false}
          onSubmit={handleSubmit}
        />
      </PageWrapper>
    </div>
  );
};

export default RegistrationCustomFieldNew;
