import React, { useState } from 'react';

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
import useProjectById from 'api/projects/useProjectById';

import { trackEventByName } from 'utils/analytics';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import { FormValues } from '../Page/types';
import tracks from '../tracks';
import { convertCustomFieldsToNestedPages } from '../util';

import SurveyPage from './SurveyPage';

const SurveyForm = ({
  projectId,
  phaseId,
  participationMethod,
}: {
  projectId: string;
  phaseId?: string;
  participationMethod?: ParticipationMethod;
}) => {
  const [currentPageNumber, setCurrentPageNumber] = useState(0);

  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);
  const { data: draftIdea, isLoading } = useDraftIdeaByPhaseId(phaseId);

  const { mutateAsync: addIdea } = useAddIdea();
  const { mutateAsync: updateIdea } = useUpdateIdea();
  const { data: customFields } = useCustomFields({
    projectId,
    phaseId,
    publicFields: true,
  });

  const nestedPagesData = convertCustomFieldsToNestedPages(customFields || []);

  const lastPageNumber = nestedPagesData.length - 1;
  const onSubmit = async ({
    formValues,
    isSubmitPage,
  }: {
    formValues: FormValues;
    isSubmitPage: boolean;
  }) => {
    const anonymousUser =
      !authUser || phase?.data.attributes.allow_anonymous_participation;

    // If the user is anonymous and is not on the submit page, do not save the draft idea
    if (anonymousUser && !isSubmitPage) {
      return;
    }

    // The back-end initially returns a draft idea without an ID
    if (!draftIdea?.data.id) {
      // If the user is an admin or project moderator, we allow them to post to a specific phase
      const phase_ids =
        project && phaseId && canModerateProject(project.data, authUser)
          ? [phaseId]
          : null;

      const idea = await addIdea({
        ...formValues,
        project_id: projectId,
        phase_ids,
        publication_status: isSubmitPage ? 'published' : 'draft',
      });

      updateSearchParams({ idea_id: isSubmitPage ? idea.data.id : undefined });
    } else {
      await updateIdea({
        id: draftIdea.data.id,
        requestBody: {
          ...formValues,
          project_id: projectId,
          publication_status: isSubmitPage ? 'published' : 'draft',
        },
      });
      updateSearchParams({
        idea_id: isSubmitPage ? draftIdea.data.id : undefined,
      });
    }
    clearDraftIdea(phaseId);
    if (isSubmitPage) {
      trackEventByName(tracks.surveyFormSubmitted);
    }
  };

  const initialFormData = draftIdea?.data.attributes;

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Box w="100%">
      {nestedPagesData[currentPageNumber] && (
        <SurveyPage
          page={nestedPagesData[currentPageNumber].page}
          pages={nestedPagesData}
          pageQuestions={nestedPagesData[currentPageNumber].pageQuestions}
          currentPageNumber={currentPageNumber}
          lastPageNumber={lastPageNumber}
          setCurrentPageNumber={setCurrentPageNumber}
          participationMethod={participationMethod}
          projectId={projectId}
          onSubmit={onSubmit}
          phase={phase?.data}
          defaultValues={initialFormData}
          customFields={customFields ?? []}
        />
      )}
    </Box>
  );
};

export default SurveyForm;
