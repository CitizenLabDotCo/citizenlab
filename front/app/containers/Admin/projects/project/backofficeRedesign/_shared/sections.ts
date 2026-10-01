import messages from '../messages';

export const LINKED_SECTIONS = [
  {
    path: 'files',
    label: messages.filesSection,
    to: '/admin/projects/$projectId/files',
  },
] as const;

const SECTIONS = [
  {
    path: 'events',
    label: messages.eventsSection,
    to: '/admin/projects/$projectId/events',
  },
  ...LINKED_SECTIONS,
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
