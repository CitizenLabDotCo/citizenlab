import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

type FormTab = 'form' | 'survey-form';

const useFormBuilderGoBackUrl = (
  projectId: string,
  phaseId: string,
  tab: FormTab
) => {
  const backofficeRedesignEnabled = useProjectBackofficeRedesign();

  return backofficeRedesignEnabled
    ? `/admin/projects/${projectId}/phases/${phaseId}/setup`
    : `/admin/projects/${projectId}/phases/${phaseId}/${tab}`;
};

export default useFormBuilderGoBackUrl;
