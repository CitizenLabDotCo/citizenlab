import React, { useState } from 'react';
import clHistory from 'utils/cl-router/history';
import { isTopBarNavActive } from 'utils/helperUtils';
import {
  Outlet as RouterOutlet,
  useLocation,
  useParams,
} from 'react-router-dom';

// components
import GoBackButton from 'components/UI/GoBackButton';
import { Box, colors } from '@citizenlab/cl2-component-library';
import NavigationTabs, { Tab } from 'components/admin/NavigationTabs';
import Outlet from 'components/Outlet';

// hooks
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { insertConfiguration } from 'utils/moduleUtils';

// typings
import { InsertConfigurationOptions, ITab } from 'typings';

const Settings = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const { projectId } = useParams() as { projectId: string };
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const [tabs, setTabs] = useState<ITab[]>([
    {
      label: formatMessage(messages.general),
      name: 'general',
      url: `/admin/projects/${projectId}/settings`,
    },
    {
      label: formatMessage(messages.description),
      name: 'description',
      url: `/admin/projects/${projectId}/settings/description`,
    },
    {
      label: formatMessage(messages.projectTags),
      name: 'tags',
      url: `/admin/projects/${projectId}/settings/tags`,
    },
    {
      label: formatMessage(messages.accessRights),
      name: 'permissions',
      feature: 'private_projects',
      url: `/admin/projects/${projectId}/settings/access-rights`,
    },
    {
      label: formatMessage(messages.events),
      name: 'events',
      url: `/admin/projects/${projectId}/settings/events`,
    },
  ]);

  const handleData = (insertTabOptions: InsertConfigurationOptions<ITab>) => {
    setTabs(insertConfiguration(insertTabOptions)(tabs));
  };

  if (!project || !phases) return null;

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
            <GoBackButton onClick={goBack} customMessage={messages.back} />
          </Box>
        </NavigationTabs>
        <Box mt="58px">
          <NavigationTabs>
            {tabs.map(({ url, label }) => (
              <Tab
                label={label}
                url={url}
                key={url}
                active={isTopBarNavActive(
                  `/admin/projects/${projectId}/settings`,
                  pathname,
                  url
                )}
              />
            ))}
          </NavigationTabs>
        </Box>
      </Box>
      <Box m="80px 20px 16px 20px">
        <Outlet
          id="app.containers.Admin.projects.edit.settings"
          onData={handleData}
          project={project.data}
          phases={phases.data}
        />
        <Box p="16px 40px" background={colors.white}>
          <RouterOutlet />
        </Box>
      </Box>
    </>
  );
};

export default Settings;
