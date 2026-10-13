import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { ManagerType } from 'components/admin/PostManager';

import { useParams } from 'utils/router';

const usePrescreeningStatusFilter = (type: ManagerType) => {
  const { phaseId } = useParams({ strict: false });
  const { data: phase } = usePhase(phaseId);
  const prescreeningIdeationAllowed = useFeatureFlag({
    name: 'prescreening_ideation',
    onlyCheckAllowed: true,
  });
  const prescreeningProposalsAllowed = useFeatureFlag({
    name: 'prescreening',
    onlyCheckAllowed: true,
  });
  const prescreeningIdeationFeatureEnabled = useFeatureFlag({
    name: 'prescreening_ideation',
  });
  const prescreeningProposalsFeatureEnabled = useFeatureFlag({
    name: 'prescreening',
  });

  // Both ideation and proposal phases use the same setting.
  const phaseSettingEnabled =
    !!phase?.data.attributes.effective_prescreening_mode;
  const isEnabled =
    // We only show ideation inputs in the general input manager, so we don't need to check
    // for the proposals screening feature being allowed here.
    (prescreeningIdeationFeatureEnabled &&
      (type === 'AllIdeas' ||
        (type === 'ProjectIdeas' && phaseSettingEnabled))) ||
    (prescreeningProposalsFeatureEnabled &&
      type === 'ProjectProposals' &&
      phaseSettingEnabled);
  const showPhaseSettingIsDisabledTooltip =
    ((prescreeningIdeationFeatureEnabled && type === 'ProjectIdeas') ||
      (prescreeningProposalsFeatureEnabled && type === 'ProjectProposals')) &&
    !phaseSettingEnabled;

  const showPrescreeningUpsellTooltip =
    // We only show ideation inputs in the general input manager, so we don't need to check
    // for the proposals screening feature being allowed here.
    (!prescreeningIdeationAllowed &&
      (type === 'AllIdeas' || type === 'ProjectIdeas')) ||
    (!prescreeningProposalsAllowed && type === 'ProjectProposals');

  return {
    isEnabled,
    showPhaseSettingIsDisabledTooltip,
    showPrescreeningUpsellTooltip,
  };
};

export default usePrescreeningStatusFilter;
