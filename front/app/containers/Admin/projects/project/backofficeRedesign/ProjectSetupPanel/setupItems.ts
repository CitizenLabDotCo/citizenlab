import { MessageDescriptor } from 'utils/cl-intl';

import setupCardMessages from './SetupCards/messages';
import { SetupReadiness } from './useSetupReadiness';

export const SETUP_ITEMS: {
  key: keyof SetupReadiness;
  label: MessageDescriptor;
}[] = [
  { key: 'general', label: setupCardMessages.settingsTitle },
  { key: 'homepageCard', label: setupCardMessages.projectCardTitle },
  { key: 'area', label: setupCardMessages.areaTitle },
  { key: 'topics', label: setupCardMessages.topicTagsTitle },
  { key: 'page', label: setupCardMessages.editProjectPage },
  { key: 'methods', label: setupCardMessages.methodsTitle },
];

export const getMissingItems = (readiness: SetupReadiness) =>
  SETUP_ITEMS.filter(({ key }) => !readiness[key]);
