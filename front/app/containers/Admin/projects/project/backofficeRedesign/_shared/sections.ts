import backofficeRedesignMessages from '../messages';

import messages from './messages';

const SECTIONS = [
  {
    path: 'events',
    label: backofficeRedesignMessages.eventsSection,
    to: '/admin/projects/$projectId/events',
  },
  {
    path: 'files',
    label: backofficeRedesignMessages.filesSection,
    to: '/admin/projects/$projectId/files',
  },
  {
    path: 'messaging',
    label: messages.messagingSection,
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
