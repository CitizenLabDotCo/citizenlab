import CallToAction from './CallToAction';
import Events from './Events';
import HomepageBanner from './HomepageBanner';
import OpenToParticipation from './OpenToParticipation';
import Projects from './Projects';
import Spotlight from './Spotlight';

export const WIDGETS = {
  CallToAction,
  Events,
  HomepageBanner,
  OpenToParticipation,
  Projects,
  Spotlight,
};

type WidgetName = keyof typeof WIDGETS;

const WIDGETS_WITHOUT_POINTER_EVENTS = new Set<string>([
  'CallToAction',
  'Events',
  'HomepageBanner',
  'OpenToParticipation',
  'Projects',
  'Spotlight',
] satisfies WidgetName[]);

export const hasNoPointerEvents = (nodeName: string) => {
  return WIDGETS_WITHOUT_POINTER_EVENTS.has(nodeName);
};
