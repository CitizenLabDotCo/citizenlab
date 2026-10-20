import { IconNames } from '@citizenlab/cl2-component-library';

import filesMessages from 'containers/Admin/projects/project/files/components/messages';

export const getFileIcon = (mimeType: string): IconNames => {
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('image/')) return 'image';
  return 'page';
};

const categoryMessages = {
  meeting: filesMessages.meeting,
  interview: filesMessages.interview,
  strategic_plan: filesMessages.strategic_plan,
  info_sheet: filesMessages.info_sheet,
  policy: filesMessages.policy,
  report: filesMessages.report,
  other: filesMessages.other,
};

const isKnownCategory = (
  category: string
): category is keyof typeof categoryMessages => category in categoryMessages;

export const getCategoryMessage = (category: string) =>
  isKnownCategory(category)
    ? categoryMessages[category]
    : categoryMessages.other;
