import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';

import useLocalize from 'hooks/useLocalize';

import { PARTICIPATION_METHOD_LABELS } from 'containers/Admin/inspirationHub/constants';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from '../messages';

export interface PhaseResult {
  id: string;
  title: string;
  method: MessageDescriptor;
  count: number;
  unit: MessageDescriptor;
}

const getCount = (
  phase: IPhaseData
): { count: number; unit: MessageDescriptor } | null => {
  const { participation_method, ideas_count, votes_count } = phase.attributes;

  switch (participation_method) {
    case 'ideation':
    case 'proposals':
      return { count: ideas_count, unit: messages.phaseUnitInputs };
    case 'native_survey':
    case 'community_monitor_survey':
      return { count: ideas_count, unit: messages.phaseUnitResponses };
    case 'voting':
      return { count: votes_count, unit: messages.phaseUnitVotes };
    default:
      return null;
  }
};

const usePhaseResults = (projectId: string) => {
  const localize = useLocalize();
  const { data: phases } = usePhases(projectId);

  const results: PhaseResult[] = (phases?.data ?? []).flatMap((phase) => {
    const count = getCount(phase);
    return count
      ? [
          {
            id: phase.id,
            title: localize(phase.attributes.title_multiloc),
            method:
              PARTICIPATION_METHOD_LABELS[
                phase.attributes.participation_method
              ],
            ...count,
          },
        ]
      : [];
  });

  const contributions = results.reduce((sum, { count }) => sum + count, 0);

  return { phases: phases?.data ?? [], results, contributions };
};

export default usePhaseResults;
