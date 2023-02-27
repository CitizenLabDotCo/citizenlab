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

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  > :not(:last-child) {
    margin-right: 20px;
  }
`;

export default () => (
  <FormSection>
    <FormSectionTitle
      message={messages.passwordChangeSection}
      subtitleMessage={messages.passwordChangeSubtitle}
    />
    <Row>
      <Button
        id="deletion"
        linkTo="/profile/change-password"
        width="auto"
        justifyWrapper="left"
      >
        <FormattedMessage {...messages.changePassword} />
      </Button>
    </Row>
  </FormSection>
);
