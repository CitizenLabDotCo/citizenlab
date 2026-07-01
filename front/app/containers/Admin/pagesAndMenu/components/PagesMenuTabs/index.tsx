import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import HelmetIntl from 'components/HelmetIntl';

import { useIntl } from 'utils/cl-intl';

import pagesAndMenuMessages from '../../messages';
import { ADMIN_PAGES_MENU_PATH } from '../../routes';

import messages from './messages';
import ButtonWithLink from 'components/UI/ButtonWithLink';

type Props = {
  activeTab: 'pages' | 'menu';
  children: React.ReactNode;
};

const PagesMenuTabs = ({ activeTab, children }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box id="e2e-pages-menu-container">
      <HelmetIntl title={pagesAndMenuMessages.pagesMenuMetaTitle} />
      <Box as="nav" display="flex" w="100%" mb="24px">
        <Box
          borderBottom={
            activeTab === 'pages' ? `2px solid ${colors.primary}` : undefined
          }
          pb="4px"
          mr="20px"
          data-cy="e2e-pages-menu-pages-tab"
        >
          <ButtonWithLink
            buttonStyle="text"
            p="0"
            m="0"
            textColor={activeTab === 'pages' ? colors.textPrimary : undefined}
            to={`${ADMIN_PAGES_MENU_PATH}/pages`}
          >
            {formatMessage(messages.pagesTab)}
          </ButtonWithLink>
        </Box>
        <Box
          borderBottom={
            activeTab === 'menu' ? `2px solid ${colors.primary}` : undefined
          }
          pb="4px"
          mr="20px"
          data-cy="e2e-pages-menu-menu-tab"
        >
          <ButtonWithLink
            buttonStyle="text"
            p="0"
            m="0"
            textColor={activeTab === 'menu' ? colors.textPrimary : undefined}
            to={`${ADMIN_PAGES_MENU_PATH}/menu`}
          >
            {formatMessage(messages.menuTab)}
          </ButtonWithLink>
        </Box>
      </Box>
      {children}
    </Box>
  );
};

export default PagesMenuTabs;
