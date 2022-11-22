import React from 'react';

// components
import Button from 'components/UI/Button';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import { WrappedComponentProps } from 'react-intl';
import { Outlet as RouterOutlet } from 'react-router-dom';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

const PagesMenu = ({ intl: { formatMessage } }: WrappedComponentProps) => {
  return (
    <SectionFormWrapper
      title={formatMessage(messages.pageHeader)}
      subtitle={formatMessage(messages.pageSubtitle)}
      rightSideCTA={
        <Button
          buttonStyle="cl-blue"
          icon="plus-circle"
          id="create-custom-page"
          linkTo={'/admin/pages-menu/pages/new'}
          className="intercom-admin-pages-menu-add-page"
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
