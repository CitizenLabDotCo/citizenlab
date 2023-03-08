// Libraries
import React from 'react';

// Styles
import styled from 'styled-components';

// components
import { FormSection, FormSectionTitle } from 'components/UI/FormComponents';
import Button from 'components/UI/Button';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { IUserData } from 'services/users';

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  > :not(:last-child) {
    margin-right: 20px;
  }
`;

type PasswordChangeProps = {
  user: IUserData;
};

const PasswordChange = ({ user }: PasswordChangeProps) => {
  const userHasPreviousPassword = !user.attributes.no_password;

  const passwordChangeTitle = !userHasPreviousPassword
    ? messages.passwordAddSection
    : messages.passwordChangeSection;
  const passwordChangeSubtitle = !userHasPreviousPassword
    ? messages.passwordAddSubtitle
    : messages.passwordChangeSubtitle;
  const passwordChangeButtonText = !userHasPreviousPassword
    ? messages.addPassword
    : messages.changePassword;

  return (
    <FormSection>
      <FormSectionTitle
        message={passwordChangeTitle}
        subtitleMessage={passwordChangeSubtitle}
      />
      <Row>
        <Button
          linkTo="/profile/change-password"
          width="auto"
          justifyWrapper="left"
        >
          <FormattedMessage {...passwordChangeButtonText} />
        </Button>
      </Row>
    </FormSection>
  );
};

export default PasswordChange;
