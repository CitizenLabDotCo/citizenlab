import React, { useState } from 'react';

import { Box, Tooltip } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet } from 'react-router-dom';

import useNavbarItems from 'api/navbar/useNavbarItems';
import { MAX_NAVBAR_ITEMS } from 'api/navbar/util';

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

  const disabledAddProjectToNavbarButton =
    navbarItems.data.length >= MAX_NAVBAR_ITEMS;

  return (
    <SectionFormWrapper
      title={formatMessage(messages.pageHeader)}
      subtitle={formatMessage(messages.pageSubtitle)}
      rightSideCTA={
        <Box display="flex" gap="16px">
          <Tooltip
            content={formatMessage(messages.navBarMaxItems)}
            disabled={!disabledAddProjectToNavbarButton}
          >
            <Button
              icon="link"
              buttonStyle="text"
              onClick={() => setAddProjectModalIsOpen(true)}
              disabled={disabledAddProjectToNavbarButton}
            >
              {formatMessage(messages.addProject)}
            </Button>
          </Tooltip>
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
