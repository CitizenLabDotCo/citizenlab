import { IProjectData, ProjectSetupStep } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

// Setup steps that have no signal of their own are checked off by opening
// them, from wherever the manager got there — the checklist row or the header.
const useMarkSetupStep = (project: IProjectData) => {
  const { mutate: updateProject } = useUpdateProject();
  const goneThrough = project.attributes.completed_setup_steps ?? [];

  return (step: ProjectSetupStep) => {
    if (goneThrough.includes(step)) return;

    updateProject({
      projectId: project.id,
      completed_setup_steps: [...goneThrough, step],
    });
  };
};

export default useMarkSetupStep;
