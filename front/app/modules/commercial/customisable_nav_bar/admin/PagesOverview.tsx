import React from 'react';

// components
import Button from 'components/UI/Button';
import { ButtonWrapper } from 'components/admin/PageWrapper';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

export default () => {
  return (
    <ButtonWrapper>
      <Button
        buttonStyle="cl-blue"
        icon="plus-circle"
        linkTo="/admin/pages/new"
      >
        <FormattedMessage {...messages.addPageButton} />
      </Button>
    </ButtonWrapper>
  );
};
