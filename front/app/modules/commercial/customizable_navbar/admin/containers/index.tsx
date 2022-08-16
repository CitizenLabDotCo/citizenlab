import React from 'react';

// components
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import Button from 'components/UI/Button';
import { Outlet as RouterOutlet } from 'react-router-dom';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

const PagesMenu = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  return (
    <SectionFormWrapper
      title={formatMessage(messages.pageHeader)}
      rightSideCTA={
        <Button
          buttonStyle="admin-dark"
          icon="plus-circle"
          id="create-custom-page"
          linkTo={'/admin/pages-menu/custom/new'}
        >
          {formatMessage(messages.createCustomPageButton)}
        </Button>
      }
    >
      <RouterOutlet />
    </SectionFormWrapper>
  );
};

export default injectIntl(PagesMenu);
