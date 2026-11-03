import { IPhaseData } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import {
  PHASE_TAB_ROUTES,
  PhaseLandingTab,
  PhaseTabTarget,
} from 'containers/Admin/projects/project/projectPage/phaseRowUtils';
import { FeatureFlags, getTabs } from 'containers/Admin/projects/project/tabs';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../messages';

export type PhaseViewKey = 'build' | 'manage' | 'insights';

export type PhaseView = {
  key: PhaseViewKey;
  label: string;
  to: PhaseTabTarget;
};

// Which view each linkable phase tab lands under. Keyed by the same union as
// PHASE_TAB_ROUTES, so a tab added there has to be given a view here. Tabs
// without a route of their own (description, form, emails, …) are reached from
// inside their view rather than from the switch.
const VIEW_BY_TAB: Record<PhaseLandingTab, PhaseViewKey> = {
  setup: 'build',
  ideas: 'manage',
  proposals: 'manage',
  polls: 'manage',
  volunteering: 'manage',
  insights: 'insights',
  'survey-results': 'insights',
};

// Matched on the tab's url rather than its name: the url is the route segment,
// which is what PHASE_TAB_ROUTES is keyed by.
const isLandingTab = (url: string): url is PhaseLandingTab =>
  Object.hasOwn(VIEW_BY_TAB, url);

/**
 * The view the given route sits under. Tabs the switch doesn't link to
 * (description, form, emails, …) are worked on from the build view.
 */
export const viewFromPathname = (pathname: string): PhaseViewKey => {
  const tab = Object.entries(VIEW_BY_TAB).find(([url]) =>
    pathname.endsWith(`/${url}`)
  );

  return tab?.[1] ?? 'build';
};

const VIEW_LABELS: { key: PhaseViewKey; label: MessageDescriptor }[] = [
  { key: 'build', label: messages.buildView },
  { key: 'manage', label: messages.manageView },
  { key: 'insights', label: messages.insightsView },
];

/**
 * The views a phase is worked on through. A view only shows when the phase has
 * a tab under it, and lands on the first such tab.
 */
const usePhaseViews = (phase: IPhaseData | undefined): PhaseView[] => {
  const { formatMessage } = useIntl();
  const featureFlags: FeatureFlags = {
    typeform_enabled: useFeatureFlag({ name: 'typeform_surveys' }),
    surveys_enabled: useFeatureFlag({ name: 'surveys' }),
    report_builder_enabled: useFeatureFlag({ name: 'report_builder' }),
  };

  if (!phase) return [];

  const landingTabs = getTabs(phase, featureFlags, formatMessage)
    .map((tab) => tab.url)
    .filter(isLandingTab);

  return VIEW_LABELS.flatMap(({ key, label }) => {
    const tab = landingTabs.find((url) => VIEW_BY_TAB[url] === key);
    if (!tab) return [];

    return [{ key, label: formatMessage(label), to: PHASE_TAB_ROUTES[tab] }];
  });
};

export default usePhaseViews;
