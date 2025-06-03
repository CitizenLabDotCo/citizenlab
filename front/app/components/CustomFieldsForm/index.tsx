import React, { useRef, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useCustomFields from 'api/custom_fields/useCustomFields';
import { IdeaPublicationStatus, IIdeaData } from 'api/ideas/types';
import useAddIdea from 'api/ideas/useAddIdea';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useAuthUser from 'api/me/useAuthUser';
import { ParticipationMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import CustomFieldsPage from './CustomFieldsPage';
import { convertCustomFieldsToNestedPages } from './util';

export interface FormValues {
  title_multiloc: Multiloc;
  body_multiloc?: Multiloc;
  author_id?: string;
  idea_images_attributes?: { image: string }[];
  idea_files_attributes?: {
    file_by_content: { content: string };
    name: string;
  }[];
  location_description?: string | null;
  location_point_geojson?: GeoJSON.Point | null;
  topic_ids?: string[];
  cosponsor_ids?: string[];
  publication_status?: IdeaPublicationStatus;
}

const CustomFieldsForm = ({
  projectId,
  phaseId,
  participationMethod,

  idea,
}: {
  projectId: string;
  phaseId?: string;
  participationMethod?: ParticipationMethod;

  idea?: IIdeaData;
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
      }
    : undefined;

  return (
    <Box overflow="scroll" w="100%" ref={pagesRef}>
      {nestedPagesData[currentPageNumber] && (
        <CustomFieldsPage
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

export default CustomFieldsForm;
