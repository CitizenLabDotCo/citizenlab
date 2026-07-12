import { IPhase } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

/*
  Whether screening is actually in effect for a phase.

  A phase can carry a prescreening_mode on a platform that does not have the screening
  feature: tenant templates and project copies bring the value across from platforms that
  do. The back-end ignores the mode in that case (no input is ever put into 'prescreening'),
  so the UI must not offer screening either. Checking prescreening_mode alone would show a
  screening filter that can never match an input.

  Ideation phases are gated on prescreening_ideation, proposals phases on prescreening.
*/
const useScreeningEnabled = (phase: IPhase | undefined) => {
  const prescreeningIdeationEnabled = useFeatureFlag({
    name: 'prescreening_ideation',
  });
  const prescreeningProposalsEnabled = useFeatureFlag({ name: 'prescreening' });

  if (!phase?.data.attributes.prescreening_mode) return false;

  return phase.data.attributes.participation_method === 'proposals'
    ? prescreeningProposalsEnabled
    : prescreeningIdeationEnabled;
};

export default useScreeningEnabled;
