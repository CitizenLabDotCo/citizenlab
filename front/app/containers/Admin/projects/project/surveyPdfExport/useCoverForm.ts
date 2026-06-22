import { useMemo } from 'react';

import { useForm, useWatch, UseFormReturn } from 'react-hook-form';

import useAuthUser from 'api/me/useAuthUser';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';
import { SurveyPdfCover } from 'api/survey_responses_pdf/generateSurveyResponsesPdf';

import useLocalize from 'hooks/useLocalize';

import { getFullName } from 'utils/textUtils';

const EMPTY_COVER: SurveyPdfCover = {
  include: true,
  title: '',
  subtitle: '',
  date: '',
  preparedBy: '',
  notes: '',
};

type Args = {
  phaseId: string;
  projectId: string;
};

type Result = {
  methods: UseFormReturn<SurveyPdfCover>;
  // Referentially stable — only changes when a field is edited.
  cover: SurveyPdfCover;
};

// Owns the cover-page form: seeds it from the phase/project/current user once
// those load, and exposes a stable `cover` snapshot for the live preview.
const useCoverForm = ({ phaseId, projectId }: Args): Result => {
  const localize = useLocalize();
  const { data: phase } = usePhase(phaseId);
  const { data: project } = useProjectById(projectId);
  const { data: authUser } = useAuthUser();

  // Stable until the source data changes, so `values` seeds the form once
  // everything loads without clobbering the user's later edits.
  const coverValues = useMemo<SurveyPdfCover | undefined>(() => {
    if (!phase || !project || !authUser) return undefined;
    return {
      include: true,
      title: localize(phase.data.attributes.title_multiloc),
      subtitle: localize(project.data.attributes.title_multiloc),
      date: new Date().toLocaleDateString(),
      preparedBy: getFullName(authUser.data) || '',
      notes: '',
    };
  }, [phase, project, authUser, localize]);

  const methods = useForm<SurveyPdfCover>({
    defaultValues: EMPTY_COVER,
    values: coverValues,
  });
  const { control } = methods;

  // Per-field watch keeps `cover` stable, so CoverPreview's debounced fetch
  // doesn't reset on every render.
  const include = useWatch({ control, name: 'include' });
  const title = useWatch({ control, name: 'title' });
  const subtitle = useWatch({ control, name: 'subtitle' });
  const date = useWatch({ control, name: 'date' });
  const preparedBy = useWatch({ control, name: 'preparedBy' });
  const notes = useWatch({ control, name: 'notes' });
  const cover = useMemo<SurveyPdfCover>(
    () => ({ include, title, subtitle, date, preparedBy, notes }),
    [include, title, subtitle, date, preparedBy, notes]
  );

  return { methods, cover };
};

export default useCoverForm;
