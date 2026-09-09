import React from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';

import projectMessages from '../../messages';

const LINKED_SECTIONS = [
  {
    path: 'events',
    label: projectMessages.eventsTab,
    to: '/admin/projects/$projectId/events',
  },
  {
    path: 'files',
    label: projectMessages.filesTab,
    to: '/admin/projects/$projectId/files',
  },
] as const;

// Messaging takes over the workspace like the sections above, but is reached
// from the Next actions list instead of a link here.
const SECTIONS = [
  ...LINKED_SECTIONS,
  {
    path: 'messaging',
    label: projectMessages.messagingTab,
    to: '/admin/projects/$projectId/messaging',
  },
] as const;

export type ProjectSection = (typeof SECTIONS)[number];

export const sectionFromPathname = (
  pathname: string,
  projectId: string
): ProjectSection | undefined => {
  const segment = pathname.split(`/${projectId}/`)[1]?.split('/')[0];

  return SECTIONS.find((section) => section.path === segment);
};

const Row = typedStyled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid ${colors.grey200};
  border-radius: ${stylingConsts.borderRadius};
  text-decoration: none;
  transition: background 80ms ease-out;

  &:hover {
    background: ${colors.grey100};
  }
`;

interface Props {
  projectId: string;
}

const SectionLinks = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      {LINKED_SECTIONS.map(({ path, label, to }) => (
        <Row key={path} to={to} params={{ projectId }}>
          <Text as="span" m="0" fontSize="l" color="textPrimary">
            {formatMessage(label)}
          </Text>
          <Icon
            name="chevron-right"
            width="20px"
            height="20px"
            fill={colors.textSecondary}
            my="0px"
          />
        </Row>
      ))}
    </Box>
  );
};

export default SectionLinks;
