import React, { useEffect, useState } from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

import NewLabel from 'components/UI/NewLabel';

import { useLocation } from 'utils/router';

import projectMessages from '../../messages';
import messages from '../messages';

import NavItemRow, { NavItem } from './NavItemRow';

interface Props {
  projectId: string;
}

const ProjectNavRail = ({ projectId }: Props) => {
  const base = `/admin/projects/${projectId}`;

  const projectPageItem: NavItem = {
    name: 'project-page',
    label: messages.projectPageNav,
    url: `${base}/project-page`,
    match: `${base}/project-page`,
  };

  const utilityItems: NavItem[] = [
    {
      name: 'audience',
      label: projectMessages.audienceTab,
      url: `${base}/audience`,
      match: `${base}/audience`,
    },
    {
      name: 'messaging',
      label: projectMessages.messagingTab,
      url: `${base}/messaging`,
      match: `${base}/messaging`,
    },
    {
      name: 'events',
      label: projectMessages.eventsTab,
      url: `${base}/events`,
      match: `${base}/events`,
    },
    {
      name: 'input-360',
      label: projectMessages.filesTab,
      url: `${base}/files`,
      match: `${base}/files`,
      badge: <NewLabel />,
    },
    {
      name: 'settings',
      label: messages.settingsNav,
      url: `${base}/general`,
      match: `${base}/general`,
    },
  ];

  // The project-page group follows the active route: it stays open on the
  // project page and any of its sub-tabs, and collapses on phase/other routes.
  const { pathname } = useLocation();
  const onPageGroupRoute =
    pathname.includes(projectPageItem.match) ||
    utilityItems.some((item) => pathname.includes(item.match));

  const [pageGroupExpanded, setPageGroupExpanded] = useState(onPageGroupRoute);

  useEffect(() => {
    setPageGroupExpanded(onPageGroupRoute);
  }, [onPageGroupRoute]);

  return (
    <Box
      as="nav"
      p="12px"
      flex="0 0 auto"
      display="flex"
      flexDirection="column"
      gap="2px"
    >
      <NavItemRow
        item={projectPageItem}
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
        utilityItems.map((item) => <NavItemRow key={item.name} item={item} />)}
    </Box>
  );
};

export default ProjectNavRail;
