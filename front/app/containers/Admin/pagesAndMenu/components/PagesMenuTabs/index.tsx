import React from 'react';

import { Box, Button, colors } from '@citizenlab/cl2-component-library';

import HelmetIntl from 'components/HelmetIntl';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import pagesAndMenuMessages from '../../messages';
import { ADMIN_PAGES_MENU_PATH } from '../../routes';

import messages from './messages';

interface TabProps {
  message: MessageDescriptor;
  active: boolean;
  dataCy?: string;
  onClick: () => void;
}

const Tab = ({ message, active, dataCy, onClick }: TabProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      borderBottom={active ? `2px solid ${colors.primary}` : undefined}
      pb="4px"
      mr="20px"
      data-cy={dataCy}
    >
      <Button
        buttonStyle="text"
        p="0"
        m="0"
        textColor={active ? colors.textPrimary : undefined}
        onClick={onClick}
      >
        {formatMessage(message)}
      </Button>
    </Box>
  );
};

type Props = {
  activeTab: 'pages' | 'menu';
  children: React.ReactNode;
};

const PagesMenuTabs = ({ activeTab, children }: Props) => {
  return (
    <Box id="e2e-pages-menu-container">
      <HelmetIntl title={pagesAndMenuMessages.pagesMenuMetaTitle} />
      <Box as="nav" display="flex" w="100%" mb="24px">
        <Tab
          message={messages.pagesTab}
          active={activeTab === 'pages'}
          dataCy="e2e-pages-menu-pages-tab"
          onClick={() => clHistory.push(`${ADMIN_PAGES_MENU_PATH}/pages`)}
        />
        <Tab
          message={messages.menuTab}
          active={activeTab === 'menu'}
          dataCy="e2e-pages-menu-menu-tab"
          onClick={() => clHistory.push(`${ADMIN_PAGES_MENU_PATH}/menu`)}
        />
      </Box>
      {children}
    </Box>
  );
};

export default PagesMenuTabs;
