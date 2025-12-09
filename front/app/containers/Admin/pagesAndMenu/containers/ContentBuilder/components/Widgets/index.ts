// Shared widgets
import AboutBox, {
  aboutBoxTitle,
} from 'components/admin/ContentBuilder/Widgets/AboutBox';
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
import ThreeColumn, {
  threeColumnTitle,
} from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import TwoColumn, {
  twoColumnTitle,
} from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import WhiteSpace, {
  whiteSpaceTitle,
} from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import FolderFiles, {
  folderFilesTitle,
} from 'components/DescriptionBuilder/Widgets/FolderFiles';
import FolderTitle, {
  folderTitleTitle,
} from 'components/DescriptionBuilder/Widgets/FolderTitle';
import InfoWithAccordions, {
  infoWithAccordionsTitle,
} from 'components/DescriptionBuilder/Widgets/InfoWithAccordions';

import { MessageDescriptor } from 'utils/cl-intl';

// Homepage builder widgets
import Proposals from './_deprecated/Proposals';
import Areas, { areasTitle } from './Areas';
import CallToAction, { callToActionTitle } from './CallToAction';
import CommunityMonitorCTA, {
  communityMonitorCTATitle,
} from './CommunityMonitorCTA';
import Events, { eventsTitle } from './Events';
import FinishedOrArchived, {
  finishedOrArchivedTitle,
} from './FinishedOrArchived';
import FollowedItems, { followedItemsTitle } from './FollowedItems';
import HomepageBanner, { homepageBannerTitle } from './HomepageBanner';
import OpenToParticipation, {
  openToParticipationTitle,
} from './OpenToParticipation';
import ProjectsAndFoldersLegacy, {
  projectsAndFoldersLegacyTitle,
} from './ProjectsAndFoldersLegacy';
import Published, { publishedTitle } from './Published';
import Selection, { selectionTitle } from './Selection';
import Spotlight, { spotlightTitle } from './Spotlight';
import TextMultiloc, { textMultilocTitle } from './TextMultiloc';
import VideoEmbed, { videoEmbedTitle } from './VideoEmbed';

export const WIDGETS = {
  // Shared widgets
  AccordionMultiloc,
  ButtonMultiloc,
  IframeMultiloc,
  ImageMultiloc,
  ThreeColumn,
  TwoColumn,
  WhiteSpace,
  Published,
  Selection,
  Spotlight,

  // Homepage builder widgets
  Areas,
  CallToAction,
  CommunityMonitorCTA,
  Events,
  FollowedItems,
  FinishedOrArchived,
  HomepageBanner,
  OpenToParticipation,
  ProjectsAndFoldersLegacy,
  TextMultiloc,
  VideoEmbed,

  // RENAMED (TODO rename in migration)
  Highlight: CallToAction,
  Projects: ProjectsAndFoldersLegacy,

  // DEPRECATED (TODO remove in migration)
  Proposals,

  // Folder description builder widgets
  FolderTitle,
  FolderFiles,

  // Project description builder widgets
  InfoWithAccordions,
  AboutBox,
};

type WidgetName = keyof typeof WIDGETS;

export const WIDGET_TITLES: Record<WidgetName, MessageDescriptor> = {
  // Shared widgets
  AccordionMultiloc: accordionMultilocTitle,
  ButtonMultiloc: buttonMultilocTitle,
  IframeMultiloc: iframeTitle,
  ImageMultiloc: imageMultilocTitle,
  ThreeColumn: threeColumnTitle,
  TwoColumn: twoColumnTitle,
  WhiteSpace: whiteSpaceTitle,
  Published: publishedTitle,
  Selection: selectionTitle,
  Spotlight: spotlightTitle,

  // Homepage builder widgets
  Areas: areasTitle,
  CallToAction: callToActionTitle,
  CommunityMonitorCTA: communityMonitorCTATitle,
  Events: eventsTitle,
  FollowedItems: followedItemsTitle,
  FinishedOrArchived: finishedOrArchivedTitle,
  HomepageBanner: homepageBannerTitle,
  OpenToParticipation: openToParticipationTitle,
  ProjectsAndFoldersLegacy: projectsAndFoldersLegacyTitle,
  TextMultiloc: textMultilocTitle,
  VideoEmbed: videoEmbedTitle,

  // RENAMED
  Highlight: callToActionTitle,
  Projects: projectsAndFoldersLegacyTitle,

  // DEPRECATED
  Proposals: callToActionTitle,

  // Folder description builder widgets
  FolderTitle: folderTitleTitle,
  FolderFiles: folderFilesTitle,

  // Project description builder widgets
  InfoWithAccordions: infoWithAccordionsTitle,
  AboutBox: aboutBoxTitle,
};

const WIDGETS_WITH_CHILDREN = new Set<string>([
  'TwoColumn',
  'ThreeColumn',
  'AccordionMultiloc',
  'InfoWithAccordions',
] satisfies WidgetName[]);

export const hasChildren = (nodeName: string) => {
  return WIDGETS_WITH_CHILDREN.has(nodeName);
};

const WIDGETS_WITHOUT_POINTER_EVENTS = new Set<string>([
  // Shared widgets
  'ButtonMultiloc',
  'IframeMultiloc',
  'Published',
  'Selection',
  'Spotlight',

  // Homepage builder widgets
  'Areas',
  'CallToAction',
  'CommunityMonitorCTA',
  'Events',
  'FollowedItems',
  'FinishedOrArchived',
  'HomepageBanner',
  'OpenToParticipation',
  'ProjectsAndFoldersLegacy',
  'VideoEmbed',

  // RENAMED
  'Projects',
  'Highlight',

  // Folder description builder widgets
  'FolderTitle',
  'FolderFiles',

  // Project description builder widgets
  'InfoWithAccordions',
  'AboutBox',
] satisfies WidgetName[]);

export const hasNoPointerEvents = (nodeName: string) => {
  return WIDGETS_WITHOUT_POINTER_EVENTS.has(nodeName);
};
