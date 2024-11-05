import { MessageDescriptor } from 'utils/cl-intl';

import CallToAction, { callToActionTitle } from './CallToAction';
import Events, { eventsTitle } from './Events';
import HomepageBanner, { homepageBannerTitle } from './HomepageBanner';
import OpenToParticipation, {
  openToParticipationTitle,
} from './OpenToParticipation';
import Projects, { projectsTitle } from './Projects';
import Spotlight, { spotlightTitle } from './Spotlight';

export const WIDGETS = {
  CallToAction,
  Events,
  HomepageBanner,
  OpenToParticipation,
  Projects,
  Spotlight,

  // RENAMED (TODO rename in migration)
  Highlight: CallToAction,
};

type WidgetName = keyof typeof WIDGETS;

export const WIDGET_TITLES: Record<WidgetName, MessageDescriptor> = {
  CallToAction: callToActionTitle,
  Events: eventsTitle,
  HomepageBanner: homepageBannerTitle,
  OpenToParticipation: openToParticipationTitle,
  Projects: projectsTitle,
  Spotlight: spotlightTitle,
  Highlight: callToActionTitle,
};

const WIDGETS_WITHOUT_POINTER_EVENTS = new Set<string>([
  'CallToAction',
  'Events',
  'HomepageBanner',
  'OpenToParticipation',
  'Projects',
  'Spotlight',
  'Highlight',
] satisfies WidgetName[]);

export const hasNoPointerEvents = (nodeName: string) => {
  return WIDGETS_WITHOUT_POINTER_EVENTS.has(nodeName);
};
