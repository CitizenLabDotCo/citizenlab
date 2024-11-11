// Shared widgets
import AccordionMultiloc, {
  accordionMultilocTitle,
} from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import ButtonMultiloc, {
  buttonMultilocTitle,
} from 'components/admin/ContentBuilder/Widgets/ButtonMultiloc';
import IframeMultiloc, {
  iframeTitle,
} from 'components/admin/ContentBuilder/Widgets/IframeMultiloc';
import ImageMultiloc, {
  imageMultilocTitle,
} from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import TextMultiloc, {
  textMultilocTitle,
} from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import ThreeColumn, {
  threeColumnTitle,
} from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import TwoColumn, {
  twoColumnTitle,
} from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import WhiteSpace, {
  whiteSpaceTitle,
} from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import { MessageDescriptor } from 'utils/cl-intl';

// Homepage builder widggets
import Proposals from './_deprecated/Proposals';
import CallToAction, { callToActionTitle } from './CallToAction';
import Events, { eventsTitle } from './Events';
import HomepageBanner, { homepageBannerTitle } from './HomepageBanner';
import OpenToParticipation, {
  openToParticipationTitle,
} from './OpenToParticipation';
import Projects, { projectsTitle } from './Projects';
import Spotlight, { spotlightTitle } from './Spotlight';

export const WIDGETS = {
  // Shared widgets
  AccordionMultiloc,
  ButtonMultiloc,
  IframeMultiloc,
  ImageMultiloc,
  TextMultiloc,
  WhiteSpace,

  // Homepage builder widgets
  CallToAction,
  Events,
  HomepageBanner,
  OpenToParticipation,
  Projects,
  Spotlight,

  // RENAMED (TODO rename in migration)
  Highlight: CallToAction,

  // DEPRECATED (TODO remove in migration)
  Proposals,
  ThreeColumn,
  TwoColumn,
};

type WidgetName = keyof typeof WIDGETS;

export const WIDGET_TITLES: Record<WidgetName, MessageDescriptor> = {
  // Shared widgets
  AccordionMultiloc: accordionMultilocTitle,
  ButtonMultiloc: buttonMultilocTitle,
  IframeMultiloc: iframeTitle,
  ImageMultiloc: imageMultilocTitle,
  TextMultiloc: textMultilocTitle,
  ThreeColumn: threeColumnTitle,
  TwoColumn: twoColumnTitle,
  WhiteSpace: whiteSpaceTitle,

  // Homepage builder widgets
  CallToAction: callToActionTitle,
  Events: eventsTitle,
  HomepageBanner: homepageBannerTitle,
  OpenToParticipation: openToParticipationTitle,
  Projects: projectsTitle,
  Spotlight: spotlightTitle,

  // RENAMED
  Highlight: callToActionTitle,

  // DEPRECATED
  Proposals: callToActionTitle,
};

const WIDGETS_WITHOUT_POINTER_EVENTS = new Set<string>([
  // Shared widgets
  'ButtonMultiloc',
  'IframeMultiloc',

  // Homepage builder widgets
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
