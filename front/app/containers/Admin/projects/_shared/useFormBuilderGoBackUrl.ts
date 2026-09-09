import useFeatureFlag from 'hooks/useFeatureFlag';

/** The phase tab a form builder used to sit under. */
type FormTab = 'form' | 'survey-form';

/**
 * Where closing a form builder returns to. The workspace reaches the form from
 * the build panel and has no tab strip, so the tab the builder was opened from
 * is a dead end there: it renders in the stage the phase preview belongs in.
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
