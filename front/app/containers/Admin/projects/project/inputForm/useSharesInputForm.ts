import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';

// Ideation and voting phases share a project-level input form,
// so editing affects every such phase in the project.
// Proposals phases have a phase-specific form and never share.
const sharesProjectLevelForm = (method: string) =>
  method === 'ideation' || method === 'voting';

/**
 * Whether editing this phase's input form also changes other phases, or
 * undefined while that's still loading.
 */
const useSharesInputForm = (projectId: string, phaseId: string) => {
  const { data: phase } = usePhase(phaseId);
  const { data: phases } = usePhases(projectId);

  if (!phase || !phases) return undefined;

  const sharingPhasesCount = phases.data.filter((p) =>
    sharesProjectLevelForm(p.attributes.participation_method)
  ).length;

  return (
    sharesProjectLevelForm(phase.data.attributes.participation_method) &&
    sharingPhasesCount > 1
  );
};

export default useSharesInputForm;
