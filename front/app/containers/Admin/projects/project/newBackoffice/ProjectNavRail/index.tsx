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
import Link, { typedStyled } from 'utils/cl-router/Link';
import { useLocation } from 'utils/router';

import projectMessages from '../../messages';
import messages from '../messages';

import type { LinkProps } from '@tanstack/react-router';

const Nav = styled(Box)`
  a,
  a:hover {
    text-decoration: none;
  }
`;

const ItemRow = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 6px;
  background: ${({ active }) => (active ? colors.grey200 : 'transparent')};
  transition: background 80ms ease-out;

  &:hover {
    background: ${({ active }) => (active ? colors.grey200 : colors.grey100)};
  }
`;

// The link covers the icon + label area; it sits inside ItemRow so that an
// optional trailing control (the chevron) can live next to it as a sibling
// rather than nested inside the anchor (which would be invalid markup).
const RowLink = typedStyled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-grow: 1;
  min-width: 0;
  cursor: pointer;
`;

const ChevronButton = styled.button`
  background: transparent;
  border: none;
  padding: 2px;
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
}

interface Props {
  projectId: string;
}

const ProjectNavRail = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();

  const base = `/admin/projects/${projectId}`;

  const projectPageItem: NavItem = {
    name: 'project-page',
    label: messages.projectPageNav,
    icon: 'page',
    url: `${base}/project-page`,
    match: `${base}/project-page`,
  };

  const utilityItems: NavItem[] = [
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

  const [utilitiesExpanded, setUtilitiesExpanded] = useState(true);

  const renderItem = (item: NavItem, trailing?: React.ReactNode) => {
    const active = pathname.includes(item.match);

    return (
      <ItemRow active={active}>
        <RowLink
          to={item.url as LinkProps['to']}
          data-cy={`e2e-new-project-nav-${item.name}`}
        >
          <Icon
            name={item.icon}
            width="20px"
            height="20px"
            fill={active ? colors.primary : colors.coolGrey600}
          />
          <Box flexGrow={1} minWidth="0">
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
        </RowLink>
        {trailing}
      </ItemRow>
    );
  };

  return (
    <Nav as="nav" p="12px" flex="0 0 auto">
      <Box display="flex" flexDirection="column" gap="2px">
        {renderItem(
          projectPageItem,
          <ChevronButton
            type="button"
            aria-label="toggle-project-utilities"
            aria-expanded={utilitiesExpanded}
            onClick={() => setUtilitiesExpanded((v) => !v)}
          >
            <Icon
              name={utilitiesExpanded ? 'chevron-down' : 'chevron-right'}
              width="16px"
              height="16px"
              fill={colors.coolGrey600}
            />
          </ChevronButton>
        )}

        {utilitiesExpanded &&
          utilityItems.map((item) => (
            <Box key={item.name}>{renderItem(item)}</Box>
          ))}
      </Box>
    </Nav>
  );
};

export default ProjectNavRail;
