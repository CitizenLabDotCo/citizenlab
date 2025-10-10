import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet, useLocation, useParams } from 'react-router';
import { ITab } from 'typings';

import NavigationTabs, { Tab } from 'components/admin/NavigationTabs';
import GoBackButton from 'components/UI/GoBackButton';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isTopBarNavActive } from 'utils/helperUtils';

import messages from './messages';

const Settings = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const { projectId } = useParams() as { projectId: string };
  const tabs: ITab[] = [
    {
      label: formatMessage(messages.general),
      name: 'general',
      url: `/admin/projects/${projectId}/settings`,
      className: 'intercom-product-tour-project-settings-tab-general',
    },
    {
      label: formatMessage(messages.description),
      name: 'description',
      url: `/admin/projects/${projectId}/settings/description`,
      className: 'intercom-product-tour-project-settings-tab-description',
    },
    {
      label: formatMessage(messages.inputTags),
      name: 'tags',
      url: `/admin/projects/${projectId}/settings/tags`,
      className: 'intercom-product-tour-project-settings-tab-project-tags',
    },
    {
      label: formatMessage(messages.accessRights),
      name: 'permissions',
      url: `/admin/projects/${projectId}/settings/access-rights`,
      className: 'intercom-product-tour-project-settings-tab-access-rights',
    },
    {
      label: formatMessage(messages.data),
      name: 'data',
      url: `/admin/projects/${projectId}/settings/data`,
      className: 'intercom-product-tour-project-settings-tab-data',
    },
  ];

  const goBack = () => {
    clHistory.push(`/admin/projects/${projectId}`);
  };

  return (
    <>
      <Box display="flex" flexDirection="column">
        <NavigationTabs>
          <Box
            display="flex"
            height="58px"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            pr="24px"
          >
            <GoBackButton
              className="intercom-product-tour-project-back-to-project-page-link"
              onClick={goBack}
              customMessage={messages.back}
            />
          </Box>
        </NavigationTabs>
        <Box mt="58px">
          <NavigationTabs>
            {tabs.map(({ url, label, className }) => (
              <Tab
                label={label}
                url={url}
                key={url}
                active={isTopBarNavActive(
                  `/admin/projects/${projectId}/settings`,
                  pathname,
                  url
                )}
                className={className}
              />
            ))}
          </NavigationTabs>
        </Box>
      </Box>
      <Box m="80px 20px 16px 20px">
        <Box p="16px 40px" background={colors.white}>
          <RouterOutlet />
        </Box>
      </Box>
    </>
  );
};

export default Settings;
