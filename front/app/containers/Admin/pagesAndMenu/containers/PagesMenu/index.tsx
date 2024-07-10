import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet } from 'react-router-dom';

import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';

import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';

import AddProjectModal from '../AddProjectModal';

import messages from './messages';

const PagesMenu = () => {
  const { formatMessage } = useIntl();
  const [addProjectModalIsOpen, setAddProjectModalIsOpen] = useState(false);
  return (
    <SectionFormWrapper
      title={formatMessage(messages.pageHeader)}
      subtitle={formatMessage(messages.pageSubtitle)}
      rightSideCTA={
        <Box display="flex" gap="16px">
          <Button
            icon="link"
            buttonStyle="text"
            onClick={() => setAddProjectModalIsOpen(true)}
          >
            {formatMessage(messages.addProject)}
          </Button>
          <Button
            buttonStyle="admin-dark"
            icon="plus-circle"
            id="create-custom-page"
            linkTo={'/admin/pages-menu/pages/new'}
            className="intercom-admin-pages-menu-add-page"
          >
            {formatMessage(messages.createCustomPageButton)}
          </Button>
        </Box>
      }
    >
      <RouterOutlet />
      <AddProjectModal
        opened={addProjectModalIsOpen}
        onClose={() => setAddProjectModalIsOpen(false)}
      />
    </SectionFormWrapper>
  );
};

export default PagesMenu;
