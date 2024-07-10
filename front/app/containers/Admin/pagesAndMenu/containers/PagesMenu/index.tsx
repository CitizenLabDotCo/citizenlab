import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet } from 'react-router-dom';

import useNavbarItems from 'api/navbar/useNavbarItems';

import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';

import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';

import AddProjectNavbarItemModal from '../AddProjectNavbarItemModal';

import messages from './messages';

const PagesMenu = () => {
  const { data: navbarItems } = useNavbarItems();
  const { formatMessage } = useIntl();
  const [addProjectModalIsOpen, setAddProjectModalIsOpen] = useState(false);

  if (!navbarItems) {
    return null;
  }

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
            disabled={navbarItems.data.length >= 7}
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
      <AddProjectNavbarItemModal
        opened={addProjectModalIsOpen}
        onClose={() => setAddProjectModalIsOpen(false)}
      />
    </SectionFormWrapper>
  );
};

export default PagesMenu;
