import React, { useEffect, useState } from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

import { useLocation } from 'utils/router';

import projectMessages from '../../messages';
import messages from '../messages';

import NavItemRow, { NavItem } from './NavItemRow';

interface Props {
  projectId: string;
}

const ProjectNavRail = ({ projectId }: Props) => {
  const projectPageItem: NavItem = {
    name: 'project-page',
    label: messages.projectHomepage,
    to: '/admin/projects/$projectId/project-page',
  };

  const utilityItems: NavItem[] = [
    {
      name: 'audience',
      label: projectMessages.audienceTab,
      to: '/admin/projects/$projectId/audience',
    },
    {
      name: 'messaging',
      label: projectMessages.messagingTab,
      to: '/admin/projects/$projectId/messaging',
    },
    {
      name: 'events',
      label: projectMessages.eventsTab,
      to: '/admin/projects/$projectId/events',
    },
    {
      name: 'input-360',
      label: projectMessages.filesTab,
      to: '/admin/projects/$projectId/files',
    },
    {
      name: 'settings',
      label: messages.settingsNav,
      to: '/admin/projects/$projectId/general',
    },
  ];

  // The project-page group follows the active route: it stays open on the
  // project page and any of its sub-tabs, and collapses on phase/other routes.
  const { pathname } = useLocation();
  const isOnRoute = (to: NavItem['to']) =>
    pathname.includes(to.replace('$projectId', projectId));
  const onPageGroupRoute =
    isOnRoute(projectPageItem.to) ||
    utilityItems.some((item) => isOnRoute(item.to));

  const [pageGroupExpanded, setPageGroupExpanded] = useState(onPageGroupRoute);

  useEffect(() => {
    setPageGroupExpanded(onPageGroupRoute);
  }, [onPageGroupRoute]);

  return (
    <Box
      as="nav"
      className="intercom-product-tour-project-nav-rail"
      p="12px"
      flex="0 0 auto"
      display="flex"
      flexDirection="column"
      gap="2px"
    >
      <NavItemRow
        item={projectPageItem}
        projectId={projectId}
        trailing={
          <Box
            as="button"
            type="button"
            aria-label="toggle-project-page-group"
            aria-expanded={pageGroupExpanded}
            onClick={() => setPageGroupExpanded((expanded) => !expanded)}
            background="transparent"
            border="none"
            p="2px"
            display="flex"
            cursor="pointer"
          >
            <Icon
              name={pageGroupExpanded ? 'chevron-down' : 'chevron-right'}
              width="16px"
              height="16px"
              fill={colors.coolGrey600}
            />
          </Box>
        }
      />

      {pageGroupExpanded &&
        utilityItems.map((item) => (
          <NavItemRow key={item.name} item={item} projectId={projectId} />
        ))}
    </Box>
  );
};

export default ProjectNavRail;
