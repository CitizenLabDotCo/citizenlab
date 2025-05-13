import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { Multiloc } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';
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

const convertCustomFieldsToNestedPages = (customFields: IFlatCustomField[]) => {
  const nestedPagesData: {
    page: IFlatCustomField;
    pageQuestions: IFlatCustomField[];
  }[] = [];

  customFields.forEach((field) => {
    if (field.input_type === 'page') {
      nestedPagesData.push({
        page: field,
        pageQuestions: [],
      });
    } else {
      const lastPagesElement = nestedPagesData[nestedPagesData.length - 1];
      lastPagesElement.pageQuestions.push({
        ...field,
      });
    }
  });

  return nestedPagesData;
};
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

function getFormCompletionPercentage(
  customFields: IFlatCustomField[],
  formValues: Record<string, any> = {}
) {
  // Count total required fields and answered required fields
  let totalRequiredFields = 0;
  let answeredRequiredFields = 0;

  customFields.forEach((field) => {
    if (field.required) {
      totalRequiredFields += 1;
      if (formValues[field.key]) {
        answeredRequiredFields += 1;
      }
    }
  });

  // If no required fields, consider it 100% complete
  if (totalRequiredFields === 0) {
    return 100;
  }

  // Calculate and return percentage
  return Math.round((answeredRequiredFields / totalRequiredFields) * 100);
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
  console.log('Form completion percentage:', formCompletionPercentage);
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
          idea={idea}
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
