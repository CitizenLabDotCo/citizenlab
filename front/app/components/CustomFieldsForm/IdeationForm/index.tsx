import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useCustomFields from 'api/custom_fields/useCustomFields';
import { IIdeaData } from 'api/ideas/types';
import useAddIdea from 'api/ideas/useAddIdea';
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

import IdeationPage from './IdeationPage';

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
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

  const { mutateAsync: addIdea } = useAddIdea();
  const { mutateAsync: updateIdea } = useUpdateIdea();
  const { data: customFields } = useCustomFields({
    projectId,
    phaseId:
      participationMethod !== 'ideation' && participationMethod !== 'voting'
        ? phaseId
        : undefined,
    publicFields: true,
  });

  const nestedPagesData = convertCustomFieldsToNestedPages(customFields || []);

  const showTogglePostAnonymously =
    !!authUser &&
    phase?.data.attributes.allow_anonymous_participation &&
    participationMethod !== 'native_survey';

  const lastPageIndex = nestedPagesData.length - 1;

  const onSubmit = async (formValues: FormValues) => {
    if (currentPageIndex === nestedPagesData.length - 2) {
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
          publication_status:
            participationMethod === 'common_ground' ? 'published' : undefined,
        });
        updateSearchParams({ idea_id: idea.data.id });
        trackEventByName(tracks.ideaFormSubmitted);
      } else {
        // Strip away idea_files_attributes from the form values
        // as they are handled via separate API calls
        const { idea_files_attributes: _, ...formValuesWithoutFiles } =
          formValues;
        await updateIdea({
          id: idea.id,
          requestBody: {
            ...formValuesWithoutFiles,
          },
        });
        updateSearchParams({ idea_id: idea.id });
      }
      // This is used for the admin idea edit page only
      goBack?.();
    }
    // Go to the next page
    if (currentPageIndex < lastPageIndex) {
      setCurrentPageIndex((pageNumber: number) => pageNumber + 1);
    }
  };
  const initialFormData = idea
    ? {
        ...idea.attributes,
        author_id: idea.relationships.author?.data?.id,
        cosponsor_ids: idea.relationships.cosponsors?.data?.map(
          (cosponsor) => cosponsor.id
        ),
        topic_ids: idea.relationships.input_topics?.data.map(
          (topic) => topic.id
        ),
      }
    : undefined;

  return (
    <Box w="100%">
      {nestedPagesData[currentPageIndex] && (
        <IdeationPage
          page={nestedPagesData[currentPageIndex].page}
          pageQuestions={nestedPagesData[currentPageIndex].pageQuestions}
          currentPageIndex={currentPageIndex}
          lastPageIndex={lastPageIndex}
          setCurrentPageIndex={setCurrentPageIndex}
          showTogglePostAnonymously={showTogglePostAnonymously}
          participationMethod={participationMethod}
          ideaId={idea?.id}
          projectId={projectId}
          onSubmit={onSubmit}
          phase={phase?.data}
          defaultValues={initialFormData}
          pages={nestedPagesData}
        />
      )}
    </Box>
  );
};

export default IdeationForm;
