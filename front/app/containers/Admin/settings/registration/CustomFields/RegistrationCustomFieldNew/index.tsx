import React from 'react';
import styled from 'styled-components';
import { addCustomFieldForUsers } from 'components/UserCustomFields/services/userCustomFields';
import clHistory from 'utils/cl-router/history';

import GoBackButton from 'components/UI/GoBackButton';
import PageWrapper from 'components/admin/PageWrapper';
import RegistrationCustomFieldForm, {
  FormValues,
} from '../RegistrationCustomFieldForm';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

interface Props {}

class RegistrationCustomFieldNew extends React.Component<Props> {
  handleSubmit = async (values: FormValues) => {
    const result = await addCustomFieldForUsers({
      ...values,
    });

    if (this.hasOptions(values.input_type)) {
      clHistory.push(
        `/admin/settings/registration/custom-fields/${result.data.id}/options`
      );
    } else {
      clHistory.push('/admin/settings/registration');
    }
  };

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
          <RegistrationCustomFieldForm
            mode="new"
            builtInField={false}
            onSubmit={this.handleSubmit}
          />
        </PageWrapper>
      </div>
    );
  }
}

export default RegistrationCustomFieldNew;
