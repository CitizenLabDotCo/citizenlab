import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { Multiloc } from 'typings';

import useCustomFields from 'api/custom_fields/useCustomFields';
import { IdeaPublicationStatus } from 'api/ideas/types';
import useAddIdea from 'api/ideas/useAddIdea';
import useIdeaById from 'api/ideas/useIdeaById';
import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useAuthUser from 'api/me/useAuthUser';
import { ParticipationMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import ContentUploadDisclaimer from 'components/ContentUploadDisclaimer';

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
  initialFormData,
}: {
  projectId: string;
  phaseId?: string;
  participationMethod?: ParticipationMethod;
  initialFormData?: FormValues;
}) => {
  const [isDisclaimerOpened, setIsDisclaimerOpened] = useState(false);
  const { slug, ideaId } = useParams();
  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);
  const { data: ideaWithSlug } = useIdeaBySlug(slug || null);
  const { data: ideaWithId } = useIdeaById(ideaId);
  const { mutateAsync: addIdea } = useAddIdea();
  const { mutateAsync: updateIdea } = useUpdateIdea();
  const { data: customFields } = useCustomFields({
    projectId,
    phaseId: participationMethod !== 'ideation' ? phaseId : undefined,
  });

  const idea = ideaWithSlug || ideaWithId;

  const [formValues, setFormValues] = useState<FormValues | undefined>(
    initialFormData
  );
  const [currentPageNumber, setCurrentPageNumber] = useState(0);

  const nestedPagesData = convertCustomFieldsToNestedPages(customFields || []);

  const showTogglePostAnonymously =
    phase?.data.attributes.allow_anonymous_participation &&
    participationMethod !== 'native_survey';

  // Copyright disclaimer is needed if the user is uploading files or images
  const disclaimerNeeded =
    formValues?.idea_files_attributes?.length ||
    formValues?.idea_images_attributes?.length ||
    (formValues?.body_multiloc &&
      Object.values(formValues.body_multiloc).some((value) =>
        value.includes('<img')
      ));

  const pageButtonLabelMultiloc = customFields?.find(
    (field) => field.id === nestedPagesData[currentPageNumber].page.id
  )?.page_button_label_multiloc;

  const onSubmit = async (
    formValues: FormValues,
    isDisclamerAccepted?: boolean
  ) => {
    setFormValues((prevValues) =>
      prevValues
        ? {
            ...prevValues,
            ...formValues,
          }
        : formValues
    );
    if (currentPageNumber === nestedPagesData.length - 2) {
      if (disclaimerNeeded && !isDisclamerAccepted) {
        setIsDisclaimerOpened(true);
        return;
      }

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
          id: idea.data.id,
          requestBody: {
            ...formValues,
          },
        });
        updateSearchParams({ idea_id: idea.data.id });
      }
    }
    // Go to the next page
    if (currentPageNumber < nestedPagesData.length - 1) {
      setCurrentPageNumber((pageNumber: number) => pageNumber + 1);
    }
  };

  const formCompletionPercentage = getFormCompletionPercentage(
    customFields || [],
    formValues
  );

  const onAcceptDisclaimer = async () => {
    setIsDisclaimerOpened(false);
    if (formValues) {
      await onSubmit(formValues, true);
    }
  };

  const onCancelDisclaimer = () => {
    setIsDisclaimerOpened(false);
  };

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
      <ContentUploadDisclaimer
        isDisclaimerOpened={isDisclaimerOpened}
        onAcceptDisclaimer={onAcceptDisclaimer}
        onCancelDisclaimer={onCancelDisclaimer}
      />
    </Box>
  );
};

export default CustomFieldsForm;
