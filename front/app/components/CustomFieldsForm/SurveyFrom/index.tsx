import React, { useRef, useState } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import useCustomFields from 'api/custom_fields/useCustomFields';
import useAddIdea from 'api/ideas/useAddIdea';
import useDraftIdeaByPhaseId from 'api/ideas/useDraftIdeaByPhaseId';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useAuthUser from 'api/me/useAuthUser';
import { ParticipationMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import { convertCustomFieldsToNestedPages } from '../util';

import SurveyPage, { FormValues } from './SurveyPage';

const SurveyForm = ({
  projectId,
  phaseId,
  participationMethod,
}: {
  projectId: string;
  phaseId?: string;
  participationMethod?: ParticipationMethod;
}) => {
  const pagesRef = useRef<HTMLDivElement | null>(null);
  const [currentPageNumber, setCurrentPageNumber] = useState(0);

  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);
  const { data: draftIdea, isLoading } = useDraftIdeaByPhaseId(phaseId);

  const { mutateAsync: addIdea } = useAddIdea();
  const { mutateAsync: updateIdea } = useUpdateIdea();
  const { data: customFields } = useCustomFields({
    projectId,
    phaseId: participationMethod !== 'ideation' ? phaseId : undefined,
  });

  const nestedPagesData = convertCustomFieldsToNestedPages(customFields || []);

  const showTogglePostAnonymously =
    phase?.data.attributes.allow_anonymous_participation &&
    participationMethod !== 'native_survey';

  const pageButtonLabelMultiloc = customFields?.find(
    (field) => field.id === nestedPagesData[currentPageNumber].page.id
  )?.page_button_label_multiloc;

  const lastPageNumber = nestedPagesData.length - 1;

  const onSubmit = async (formValues: FormValues) => {
    const isSubmitPage = currentPageNumber === nestedPagesData.length - 2;
    // Something strage is happening here where the back-end is returning a draft idea without an ID
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
      updateSearchParams({ idea_id: idea.data.id });
    } else {
      await updateIdea({
        id: draftIdea.data.id,
        requestBody: {
          ...formValues,
          project_id: projectId,
          publication_status: isSubmitPage ? 'published' : 'draft',
        },
      });
      updateSearchParams({ idea_id: draftIdea.data.id });
    }
    // Go to the next page
    if (currentPageNumber < lastPageNumber) {
      setCurrentPageNumber((pageNumber: number) => pageNumber + 1);
    }
  };

  const initialFormData = draftIdea
    ? {
        ...draftIdea.data.attributes,
        author_id: draftIdea.data.relationships.author?.data?.id,
        cosponsor_ids: draftIdea.data.relationships.cosponsors?.data?.map(
          (cosponsor) => cosponsor.id
        ),
        topic_ids: draftIdea.data.relationships.topics?.data.map(
          (topic) => topic.id
        ),
      }
    : undefined;

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Box overflow="scroll" w="100%" ref={pagesRef}>
      {nestedPagesData[currentPageNumber] && (
        <SurveyPage
          page={nestedPagesData[currentPageNumber].page}
          pageQuestions={nestedPagesData[currentPageNumber].pageQuestions}
          currentPageNumber={currentPageNumber}
          lastPageNumber={lastPageNumber}
          setCurrentPageNumber={setCurrentPageNumber}
          showTogglePostAnonymously={showTogglePostAnonymously}
          participationMethod={participationMethod}
          projectId={projectId}
          onSubmit={onSubmit}
          pageButtonLabelMultiloc={pageButtonLabelMultiloc}
          phase={phase?.data}
          defaultValues={initialFormData}
          customFields={customFields ?? []}
          pagesRef={pagesRef}
        />
      )}
    </Box>
  );
};

export default SurveyForm;
