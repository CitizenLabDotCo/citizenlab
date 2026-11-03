import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

const usePublishNow = (project: IProjectData) => {
  const { mutate: updateProject, isPending } = useUpdateProject();

  const publishNow = (onDone: () => void) =>
    updateProject(
      {
        projectId: project.id,
        admin_publication_attributes: { publication_status: 'published' },
        publication_email_enabled: project.attributes.publication_email_enabled,
      },
      { onSuccess: onDone }
    );

  return { publishNow, isPending };
};

export default usePublishNow;
