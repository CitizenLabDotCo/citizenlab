import React, { useState } from 'react';

import { Box, Tooltip } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet } from 'react-router-dom';

import useNavbarItems from 'api/navbar/useNavbarItems';
import { MAX_NAVBAR_ITEMS } from 'api/navbar/util';
import useProjectFolders from 'api/project_folders/useProjectFolders';

import useFeatureFlag from 'hooks/useFeatureFlag';

import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import customPageMessages from 'containers/Admin/pagesAndMenu/containers/CustomPages/messages';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import AddProjectNavbarItemModal from '../AddProjectNavbarItemModal';

import messages from './messages';

const PagesMenu = () => {
  const { data: navbarItems } = useNavbarItems();
  const { formatMessage } = useIntl();

  const { data: projectFolders } = useProjectFolders({});
  const folderExists = !!(
    projectFolders?.data && projectFolders.data.length > 0
  );

  const [addProjectModalIsOpen, setAddProjectModalIsOpen] = useState(false);
  const canCreateCustomPages = useFeatureFlag({
    name: 'pages',
    onlyCheckAllowed: true,
  });

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
            <Box>
              <ButtonWithLink
                icon="link"
                buttonStyle="text"
                onClick={() => setAddProjectModalIsOpen(true)}
                disabled={disabledAddProjectToNavbarButton}
              >
                {folderExists
                  ? formatMessage(messages.addProjectOrFolder)
                  : formatMessage(messages.addProject)}
              </ButtonWithLink>
            </Box>
          </Tooltip>
          <Tooltip
            content={formatMessage(
              customPageMessages.contactGovSuccessToAccessPages
            )}
            disabled={canCreateCustomPages}
          >
            <Box>
              <ButtonWithLink
                buttonStyle="admin-dark"
                icon="plus-circle"
                id="create-custom-page"
                linkTo={'/admin/pages-menu/pages/new'}
                className="intercom-admin-pages-menu-add-page"
                disabled={!canCreateCustomPages}
              >
                {formatMessage(messages.createCustomPageButton)}
              </ButtonWithLink>
            </Box>
          </Tooltip>
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
