import React, { useState } from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import NewLabel from 'components/UI/NewLabel';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { useLocation } from 'utils/router';

import projectMessages from '../../messages';
import messages from '../messages';

import type { LinkProps } from '@tanstack/react-router';

const Nav = styled(Box)`
  a,
  a:hover {
    text-decoration: none;
    display: block;
  }
`;

const ItemRow = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  background: ${({ active }) => (active ? colors.grey200 : 'transparent')};
  transition: background 80ms ease-out;

  &:hover {
    background: ${({ active }) => (active ? colors.grey200 : colors.grey100)};
  }
`;

const ChevronButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  display: flex;
  cursor: pointer;
`;

interface NavItem {
  name: string;
  label: MessageDescriptor;
  icon: IconNames;
  url: string;
  // Substring of the pathname that marks this item as active.
  match: string;
  badge?: React.ReactNode;
  collapsible?: boolean;
}

interface Props {
  projectId: string;
}

const ProjectNavRail = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();

  // The "Project page" group is collapsed by default (per design).
  const [projectPageExpanded, setProjectPageExpanded] = useState(false);

  const base = `/admin/projects/${projectId}`;

  const items: NavItem[] = [
    {
      name: 'project-page',
      label: messages.projectPageNav,
      icon: 'page',
      url: `${base}/project-page`,
      match: `${base}/project-page`,
      collapsible: true,
    },
    {
      name: 'audience',
      label: projectMessages.audienceTab,
      icon: 'users',
      url: `${base}/audience`,
      match: `${base}/audience`,
    },
    {
      name: 'messaging',
      label: projectMessages.messagingTab,
      icon: 'comments',
      url: `${base}/messaging`,
      match: `${base}/messaging`,
    },
    {
      name: 'events',
      label: projectMessages.eventsTab,
      icon: 'calendar',
      url: `${base}/events`,
      match: `${base}/events`,
    },
    {
      name: 'input-360',
      label: projectMessages.filesTab,
      icon: 'file',
      url: `${base}/files`,
      match: `${base}/files`,
      badge: <NewLabel />,
    },
    {
      name: 'settings',
      label: messages.settingsNav,
      icon: 'settings',
      url: `${base}/general`,
      match: `${base}/general`,
    },
  ];

  return (
    <Nav as="nav" p="12px">
      <Box display="flex" flexDirection="column" gap="2px">
        {items.map((item) => {
          const active = pathname.includes(item.match);

          return (
            <Box key={item.name}>
              <Link to={item.url as LinkProps['to']}>
                <ItemRow
                  active={active}
                  data-cy={`e2e-new-project-nav-${item.name}`}
                >
                  <Icon
                    name={item.icon}
                    width="20px"
                    height="20px"
                    fill={active ? colors.primary : colors.coolGrey600}
                  />
                  <Box flexGrow={1}>
                    <Text
                      m="0"
                      fontSize="s"
                      color={active ? 'primary' : 'coolGrey700'}
                      fontWeight={active ? 'semi-bold' : 'normal'}
                    >
                      {formatMessage(item.label)}
                    </Text>
                  </Box>
                  {item.badge}
                  {item.collapsible && (
                    <ChevronButton
                      type="button"
                      aria-label="toggle-project-page"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setProjectPageExpanded((v) => !v);
                      }}
                    >
                      <Icon
                        name={
                          projectPageExpanded ? 'chevron-down' : 'chevron-right'
                        }
                        width="16px"
                        height="16px"
                        fill={colors.coolGrey600}
                      />
                    </ChevronButton>
                  )}
                </ItemRow>
              </Link>

              {item.collapsible && projectPageExpanded && (
                <Box pl="38px" py="6px">
                  <Text m="0" fontSize="xs" color="textSecondary">
                    {formatMessage(messages.projectPagePlaceholder)}
                  </Text>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Nav>
  );
};

export default ProjectNavRail;
