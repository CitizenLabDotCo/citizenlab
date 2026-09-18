import useFeatureFlag from 'hooks/useFeatureFlag';

type FormTab = 'form' | 'survey-form';

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
