import { MessageDescriptor } from 'utils/cl-intl';

import messages from '../messages';

import { SetupReadiness } from './useSetupReadiness';

export const SETUP_ITEMS: {
  key: keyof SetupReadiness;
  label: MessageDescriptor;
}[] = [
  { key: 'general', label: messages.generalInformation },
  { key: 'page', label: messages.projectPageItem },
  { key: 'homepageCard', label: messages.homepageCard },
  { key: 'area', label: messages.areaItem },
  { key: 'topics', label: messages.topicTags },
  { key: 'methods', label: messages.participationMethods },
];

export const getMissingItems = (readiness: SetupReadiness) =>
  SETUP_ITEMS.filter(({ key }) => !readiness[key]);
