import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { Multiloc } from 'typings';

import useCustomFields from 'api/custom_fields/useCustomFields';
import { IdeaPublicationStatus } from 'api/ideas/types';
import useAddIdea from 'api/ideas/useAddIdea';
import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import useAuthUser from 'api/me/useAuthUser';
import { ParticipationMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import CustomFieldsPage from './CustomFieldsPage';
import {
  convertCustomFieldsToNestedPages,
  getFormCompletionPercentage,
} from './util';

interface FormValues {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  author_id?: string;
  idea_images_attributes?: { image: string }[];
  idea_files_attributes?: {
    file_by_content: { content: string };
    name: string;
  };
  location_description?: string;
  location_point_geojson?: GeoJSON.Point;
  topic_ids?: string[];
  cosponsor_ids?: string[];
  publication_status?: IdeaPublicationStatus;
}

const CustomFieldsForm = ({
  projectId,
  phaseId,
  participationMethod,
}: {
  projectId: string;
  phaseId?: string;
  participationMethod?: ParticipationMethod;
}) => {
  const { slug } = useParams() as { slug: string };
  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);
  const { data: idea } = useIdeaBySlug(slug);
  const { mutateAsync: addIdea } = useAddIdea();
  const { data: customFields } = useCustomFields({
    projectId,
    phaseId: participationMethod !== 'ideation' ? phaseId : undefined,
  });

  const [formValues, setFormValues] = useState<FormValues | undefined>();
  const [currentPageNumber, setCurrentPageNumber] = useState(0);

  const nestedPagesData = convertCustomFieldsToNestedPages(customFields || []);

  const showTogglePostAnonymously =
    phase?.data.attributes.allow_anonymous_participation &&
    participationMethod !== 'native_survey';

  const pageButtonLabelMultiloc = customFields?.find(
    (field) => field.id === nestedPagesData[currentPageNumber].page.id
  )?.page_button_label_multiloc;

  const onSubmit = async (formValues: FormValues) => {
    setFormValues((prevValues) =>
      prevValues
        ? {
            ...prevValues,
            ...formValues,
          }
        : formValues
    );

    if (currentPageNumber === nestedPagesData.length - 2) {
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
    }
  };

  const formCompletionPercentage = getFormCompletionPercentage(
    customFields || [],
    formValues
  );

  return (
    <Box overflow="scroll" w="100%">
      {nestedPagesData[currentPageNumber] && (
        <CustomFieldsPage
          key={nestedPagesData[currentPageNumber].page.id}
          page={nestedPagesData[currentPageNumber].page}
          pageQuestions={nestedPagesData[currentPageNumber].pageQuestions}
          currentPageNumber={currentPageNumber}
          lastPageNumber={nestedPagesData.length - 1}
          setCurrentPageNumber={setCurrentPageNumber}
          showTogglePostAnonymously={showTogglePostAnonymously}
          participationMethod={participationMethod}
          ideaId={idea?.data.id}
          projectId={projectId}
          onSubmit={onSubmit}
          pageButtonLabelMultiloc={pageButtonLabelMultiloc}
          phase={phase?.data}
          defaultValues={formValues}
          formCompletionPercentage={formCompletionPercentage}
        />
      )}
    </Box>
  );
};

export default CustomFieldsForm;
