import useFeatureFlag from 'hooks/useFeatureFlag';

type FormTab = 'form' | 'survey-form';

/**
 * Where closing a form builder returns to. The workspace has no tab strip and
 * reaches the form from the build panel, so returning to a tab would land the
 * manager in the stage the phase preview belongs in.
 */
const useFormBuilderGoBackUrl = (
  projectId: string,
  phaseId: string,
  tab: FormTab
) => {
  const backofficeRedesignEnabled = useFeatureFlag({
    name: 'project_backoffice_redesign',
  });

  return backofficeRedesignEnabled
    ? `/admin/projects/${projectId}/phases/${phaseId}/setup`
    : `/admin/projects/${projectId}/phases/${phaseId}/${tab}`;
};

export default useFormBuilderGoBackUrl;
