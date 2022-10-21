import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import Button from 'components/UI/Button';
import { Outlet as RouterOutlet } from 'react-router-dom';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

const PagesMenu = ({ intl: { formatMessage } }: WrappedComponentProps) => {
  const previewNewCustomPages = useFeatureFlag({
    name: 'preview_new_custom_pages',
  });

  return (
    <SectionFormWrapper
      title={formatMessage(messages.pageHeader)}
      subtitle={formatMessage(messages.pageSubtitle)}
      rightSideCTA={
        previewNewCustomPages && (
          <Button
            buttonStyle="cl-blue"
            icon="plus-circle"
            id="create-custom-page"
            linkTo={'/admin/pages-menu/custom/new'}
          >
            {formatMessage(messages.createCustomPageButton)}
          </Button>
        )
      }
    >
      <RouterOutlet />
    </SectionFormWrapper>
  );
};

export default injectIntl(PagesMenu);
