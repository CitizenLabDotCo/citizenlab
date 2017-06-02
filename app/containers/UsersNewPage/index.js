import React from 'react';
import HelmetIntl from 'components/HelmetIntl';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';

import SignInButton from './components/signInButton';
import FacebookAuthButton from 'components/forms/facebookAuthButton';
import Form from './components/form';

import messages from './messages';

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 30px;
  padding-right: 30px;
  margin-bottom: 50px;
`;

export class UsersNewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <PageContainer>
        <FormContainer>
          <HelmetIntl
            title={messages.helmetTitle}
            description={messages.helmetDescription}
          />
          <h1>
            <FormattedMessage {...messages.header} />
          </h1>

          <Form />
          <SignInButton />
          <FacebookAuthButton type={'login'} />
        </FormContainer>
      </PageContainer>
    );
  }
}


export default UsersNewPage;
