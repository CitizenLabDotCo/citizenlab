import React, { useRef, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useCustomFields from 'api/custom_fields/useCustomFields';
import { IIdeaData } from 'api/ideas/types';
import useAddIdea from 'api/ideas/useAddIdea';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useAuthUser from 'api/me/useAuthUser';
import { ParticipationMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import { convertCustomFieldsToNestedPages } from '../util';

import IdeationPage, { FormValues } from './IdeationPage';

const IdeationForm = ({
  projectId,
  phaseId,
  participationMethod,
  idea,
  goBack,
}: {
  projectId: string;
  phaseId?: string;
  participationMethod?: ParticipationMethod;
  idea?: IIdeaData;
  // For the admin idea edit page only
  goBack?: () => void;
}) => {
  const pagesRef = useRef<HTMLDivElement | null>(null);
  const [currentPageNumber, setCurrentPageNumber] = useState(0);

  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

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
    if (currentPageNumber === nestedPagesData.length - 2) {
      if (!idea) {
        // If the user is an admin or project moderator, we allow them to post to a specific phase
        const phase_ids =
          project && phaseId && canModerateProject(project.data, authUser)
            ? [phaseId]
            : null;

        const idea = await addIdea({
          ...formValues,
          project_id: projectId,
          phase_ids,
          publication_status: undefined, // TODO: Change this logic when handling draft ideas
        });
        updateSearchParams({ idea_id: idea.data.id });
      } else {
        await updateIdea({
          id: idea.id,
          requestBody: {
            ...formValues,
          },
        });
        updateSearchParams({ idea_id: idea.id });
      }
      // This is used for the admin idea edit page only
      goBack?.();
    }
    // Go to the next page
    if (currentPageNumber < lastPageNumber) {
      setCurrentPageNumber((pageNumber: number) => pageNumber + 1);
    }
  };

  const initialFormData = idea
    ? {
        ...idea.attributes,
        author_id: idea.relationships.author?.data?.id,
        cosponsor_ids: idea.relationships.cosponsors?.data?.map(
          (cosponsor) => cosponsor.id
        ),
        topic_ids: idea.relationships.topics?.data.map((topic) => topic.id),
      }
    : undefined;

  return (
    <Box overflow="scroll" w="100%" ref={pagesRef}>
      {nestedPagesData[currentPageNumber] && (
        <IdeationPage
          page={nestedPagesData[currentPageNumber].page}
          pageQuestions={nestedPagesData[currentPageNumber].pageQuestions}
          currentPageNumber={currentPageNumber}
          lastPageNumber={lastPageNumber}
          setCurrentPageNumber={setCurrentPageNumber}
          showTogglePostAnonymously={showTogglePostAnonymously}
          participationMethod={participationMethod}
          ideaId={idea?.id}
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

export default IdeationForm;
