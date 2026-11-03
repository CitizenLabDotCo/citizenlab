import React, { useRef, useState } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import useCustomFields from 'api/custom_fields/useCustomFields';
import useAddIdea from 'api/ideas/useAddIdea';
import useDraftIdeaByPhaseId, {
  clearDraftIdea,
} from 'api/ideas/useDraftIdeaByPhaseId';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useAuthUser from 'api/me/useAuthUser';
import { ParticipationMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';

import useOnQuerySuccess from 'hooks/useOnQuerySuccess';

import { customerAnalyticsEvents, trackEventByName } from 'utils/analytics';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import { FormValues } from '../Page/types';
import { convertCustomFieldsToNestedPages } from '../util';

import SurveyPage from './SurveyPage';
import { getInitialData } from './utils';

const SurveyForm = ({
  projectId,
  phaseId,
  participationMethod,
}: {
  projectId: string;
  phaseId?: string;
  participationMethod?: ParticipationMethod;
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  // Track the actual path the user has taken through the survey
  // This helps with proper go-back navigation when users can reach the same page through multiple paths
  const [userNavigationHistory, setUserNavigationHistory] = useState<number[]>([
    0,
  ]);
  // Per-page <SurveyPage> remounts on every navigation (via key={currentPageIndex}),
  // which destroys the React Hook Form instance. Authenticated users don't lose
  // values because each page's submit persists a draft on the server, refetched
  // into `initialFormData`. Anonymous users have no draft (the per-page submit
  // is a no-op), so we accumulate their values here and feed them back as
  // defaultValues on each remount.
  const [accumulatedValues, setAccumulatedValues] = useState<FormValues>({});

  const { data: authUser } = useAuthUser();
  const { data: phase } = usePhase(phaseId);
  const draftIdeaQuery = useDraftIdeaByPhaseId(phaseId);
  const { data: draftIdea, isLoading: isLoadingDraftIdea } = draftIdeaQuery;

  // The draft refetches after every saved page; only the first load counts.
  const hasTrackedStart = useRef(false);
  useOnQuerySuccess(draftIdeaQuery, () => {
    if (hasTrackedStart.current) return;
    hasTrackedStart.current = true;

    trackEventByName(customerAnalyticsEvents.surveyStarted, {
      project_id: projectId,
      phase_id: phaseId,
      participation_method: participationMethod,
      // Only a previously saved draft has an id.
      resumed: !!draftIdea?.data.id,
    });
  });

  const { mutateAsync: addIdea } = useAddIdea();
  const { mutateAsync: updateIdea } = useUpdateIdea();
  const { data: customFields, isLoading: isLoadingCustomFields } =
    useCustomFields({
      projectId,
      phaseId,
      publicFields: true,
    });

  const nestedPagesData = convertCustomFieldsToNestedPages(customFields || []);

  const lastPageIndex = nestedPagesData.length - 1;

  if (!phase) return null;

  const onSubmit = async ({
    formValues,
    pageValues,
    isSubmitPage,
  }: {
    formValues: FormValues;
    pageValues: FormValues;
    isSubmitPage: boolean;
  }) => {
    // Carry the page's values forward across the next remount so anonymous
    // users don't lose answers from previous pages, and so the final submit
    // sends every answer from every visited page.
    // pageValues comes first so that an answer the user cleared ends up as
    // undefined instead of keeping the value it had before: the yup resolver
    // leaves such a key out of formValues, and a spread can only overwrite
    // keys it has. formValues still wins for every answer it does carry,
    // because its values are cast to the types the API expects.
    const mergedValues = { ...accumulatedValues, ...pageValues, ...formValues };
    setAccumulatedValues(mergedValues);

    // The draft idea endpoint relies on the idea having a user id / being linked to a user
    // If there is no user (because permitted_by is 'everyone' and the user is signed out)
    // there is no draft idea. So instead we wait until we are on the submit page
    // and then send the whole survey as one big POST.
    if (!authUser && !isSubmitPage) {
      return;
    }

    // The back-end initially returns a draft idea without an ID
    if (!draftIdea?.data.id) {
      const idea = await addIdea({
        phaseId: phase.data.id,
        requestBody: {
          ...mergedValues,
          publication_status: isSubmitPage ? 'published' : 'draft',
        },
      });

      updateSearchParams({ idea_id: isSubmitPage ? idea.data.id : undefined });
    } else {
      await updateIdea({
        id: draftIdea.data.id,
        requestBody: {
          ...mergedValues,
          publication_status: isSubmitPage ? 'published' : 'draft',
        },
      });
      updateSearchParams({
        idea_id: isSubmitPage ? draftIdea.data.id : undefined,
      });
    }

    clearDraftIdea(phaseId);
    if (isSubmitPage) {
      trackEventByName(customerAnalyticsEvents.surveySubmitted, {
        project_id: projectId,
        phase_id: phase.data.id,
        participation_method: participationMethod,
      });
    }
  };

  const initialFormData = getInitialData(draftIdea, authUser, phase);

  // The options of a select question are part of this response, so a question
  // with thousands of them keeps the whole form waiting.
  if (isLoadingDraftIdea || isLoadingCustomFields) {
    return (
      <Box mt="20px" display="flex" justifyContent="center" w="100%">
        <Spinner />
      </Box>
    );
  }

  return (
    <Box w="100%">
      {nestedPagesData[currentPageIndex] && (
        <SurveyPage
          key={currentPageIndex}
          page={nestedPagesData[currentPageIndex].page}
          pages={nestedPagesData}
          pageQuestions={nestedPagesData[currentPageIndex].pageQuestions}
          currentPageIndex={currentPageIndex}
          lastPageIndex={lastPageIndex}
          setCurrentPageIndex={setCurrentPageIndex}
          userNavigationHistory={userNavigationHistory}
          setUserNavigationHistory={setUserNavigationHistory}
          participationMethod={participationMethod}
          projectId={projectId}
          onSubmit={onSubmit}
          onCapturePageValues={(values) =>
            setAccumulatedValues((prev) => ({ ...prev, ...values }))
          }
          phase={phase.data}
          defaultValues={{ ...initialFormData, ...accumulatedValues }}
        />
      )}
    </Box>
  );
};

export default SurveyForm;
