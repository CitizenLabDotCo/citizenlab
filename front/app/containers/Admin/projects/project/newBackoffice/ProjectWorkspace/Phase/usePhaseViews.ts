import { IPhaseData } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { FeatureFlags, getTabs } from '../../../tabs';
import { PHASE_TAB_ROUTES, PhaseTabTarget } from '../../phaseRowUtils';
import messages from '../messages';

export type PhaseViewKey = 'build' | 'manage' | 'insights';

export type PhaseView = {
  key: PhaseViewKey;
  label: string;
  /** Absent when the phase has no tab under this view, which makes it unreachable. */
  to?: PhaseTabTarget;
};

// Which of the three views each phase tab belongs under. `getTabs` stays the
// authority on which tabs a phase actually has; this only says where they land.
const VIEW_BY_TAB: Record<string, PhaseViewKey | undefined> = {
  setup: 'build',
  description: 'build',
  form: 'build',
  'survey-form': 'build',
  map: 'build',
  'access-rights': 'build',
  emails: 'build',
  ideas: 'manage',
  proposals: 'manage',
  polls: 'manage',
  volunteering: 'manage',
  insights: 'insights',
  'survey-results': 'insights',
};

const TAB_ROUTES: Record<string, PhaseTabTarget | undefined> = PHASE_TAB_ROUTES;

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

  const tabs = getTabs(phase, featureFlags, formatMessage);

  return VIEW_LABELS.map(({ key, label }) => {
    const tab = tabs.find((candidate) => VIEW_BY_TAB[candidate.name] === key);

    return {
      key,
      label: formatMessage(label),
      to: tab && TAB_ROUTES[tab.name],
    };
  });
};

export default usePhaseViews;
