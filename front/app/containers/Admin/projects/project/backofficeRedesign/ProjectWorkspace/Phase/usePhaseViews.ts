import { IPhaseData, ParticipationMethod } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { supportsNativeSurvey } from '../../../inputImporter/ReviewSection/utils';
import {
  PHASE_TAB_ROUTES,
  PhaseLandingTab,
  PhaseTabTarget,
} from '../../../projectPage/phaseRowUtils';
import { FeatureFlags, getTabs } from '../../../tabs';
import messages from '../messages';

export type PhaseViewKey = 'build' | 'manage' | 'insights';

export type PhaseView = {
  key: PhaseViewKey;
  label: string;
  /** Absent when the phase has no tab under this view, which makes it unreachable. */
  to?: PhaseTabTarget;
  /** Why the view is unreachable, so a locked one says more than nothing. */
  lockedReason?: string;
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

/**
 * Why a view has no tab to land on. The reasons differ by method rather than
 * being one line: a survey does collect input, it just isn't managed here.
 * Returns nothing when the combination isn't one we can explain, so the switch
 * stays silent rather than asserting something untrue.
 */
const lockedReason = (
  view: PhaseViewKey,
  method: ParticipationMethod
): MessageDescriptor | undefined => {
  if (method === 'information') {
    return view === 'manage'
      ? messages.noInputToManage
      : messages.noInputToAnalyse;
  }

  if (view === 'manage' && supportsNativeSurvey(method)) {
    return messages.surveyResponsesInInsights;
  }

  if (method === 'survey' || method === 'document_annotation') {
    return view === 'manage'
      ? messages.externalToolToManage
      : messages.externalToolToAnalyse;
  }

  return undefined;
};

const VIEW_LABELS: { key: PhaseViewKey; label: MessageDescriptor }[] = [
  { key: 'build', label: messages.buildView },
  { key: 'manage', label: messages.manageView },
  { key: 'insights', label: messages.insightsView },
];

/**
 * The three views a phase is worked on through. All three always show, so the
 * set of choices stays the same everywhere; each lands on the first tab that
 * belongs to it.
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

  return VIEW_LABELS.map(({ key, label }) => {
    const tab = landingTabs.find((url) => VIEW_BY_TAB[url] === key);
    const reason =
      tab === undefined
        ? lockedReason(key, phase.attributes.participation_method)
        : undefined;

    return {
      key,
      label: formatMessage(label),
      to: tab && PHASE_TAB_ROUTES[tab],
      lockedReason: reason && formatMessage(reason),
    };
  });
};

export default usePhaseViews;
