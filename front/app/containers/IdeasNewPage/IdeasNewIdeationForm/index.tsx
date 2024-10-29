import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { parse } from 'qs';
import { Multiloc } from 'typings';

import { IdeaPublicationStatus } from 'api/ideas/types';
import useAddIdea from 'api/ideas/useAddIdea';
import useAuthUser from 'api/me/useAuthUser';
import { IPhases, IPhaseData } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import { IProject } from 'api/projects/types';

import useInputSchema from 'hooks/useInputSchema';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import AnonymousParticipationConfirmationModal from 'components/AnonymousParticipationConfirmationModal';
import ContentUploadDisclaimer from 'components/ContentUploadDisclaimer';
import Form from 'components/Form';
import { AjvErrorGetter, ApiErrorGetter } from 'components/Form/typings';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';
import PageContainer from 'components/UI/PageContainer';

import clHistory from 'utils/cl-router/history';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { isNilOrError } from 'utils/helperUtils';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';
import { reverseGeocode } from 'utils/locationTools';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import IdeasNewMeta from '../IdeasNewMeta';
import messages from '../messages';
import NewIdeaHeading from '../NewIdeaHeading';
import { getLocationGeojson } from '../utils';

const ProfileVisiblity = lazy(() => import('./ProfileVisibility'));

const getConfig = (
  phaseFromUrl: IPhaseData | undefined,
  phases: IPhases | undefined
) => {
  const participationMethod = phaseFromUrl
    ? phaseFromUrl.attributes.participation_method
    : getCurrentPhase(phases?.data)?.attributes.participation_method;

  if (!participationMethod) return;
  return getMethodConfig(participationMethod);
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

interface Props {
  project: IProject;
  phaseId: string | undefined;
}

const IdeasNewIdeationForm = ({ project, phaseId }: Props) => {
  const localize = useLocalize();
  const locale = useLocale();
  const [isDisclaimerOpened, setIsDisclaimerOpened] = useState(false);
  const [formData, setFormData] = useState<FormValues | null>(null);
  const { mutateAsync: addIdea } = useAddIdea();
  const { data: authUser } = useAuthUser();
  const { data: phases } = usePhases(project.data.id);
  const { data: phaseFromUrl } = usePhase(phaseId);
  const {
    schema,
    uiSchema,
    inputSchemaError,
    isLoading: isLoadingInputSchema,
  } = useInputSchema({
    projectId: project.data.id,
    phaseId,
  });
  const search = location.search;
  const [loading, setLoading] = useState(false);
  const [showAnonymousConfirmationModal, setShowAnonymousConfirmationModal] =
    useState(false);
  const [processingLocation, setProcessingLocation] = useState(false);
  const [initialFormData, setInitialFormData] = useState({});
  const [postAnonymously, setPostAnonymously] = useState(false);
  const participationContext = getCurrentPhase(phases?.data);
  const participationMethodConfig = getConfig(phaseFromUrl?.data, phases);
  const allowAnonymousPosting =
    participationContext?.attributes.allow_anonymous_participation;

  // Click on map flow : Reverse geocode the location if it's in the url params
  useEffect(() => {
    const { lat, lng } = parse(search, {
      ignoreQueryPrefix: true,
      decoder: (str, _defaultEncoder, _charset, type) => {
        return type === 'value' ? parseFloat(str) : str;
      },
    }) as { [key: string]: string | number };

    if (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNilOrError(locale)
    ) {
      setProcessingLocation(true);
      reverseGeocode(lat, lng, locale).then((address) => {
        setInitialFormData((initialFormData) => ({
          ...initialFormData,
          location_description: address,
          location_point_geojson: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        }));
        setProcessingLocation(false);
      });
    }
  }, [search, locale]);

  // Handle image disclaimer
  const handleDisclaimer = (data: FormValues) => {
    const disclaimerNeeded =
      data.idea_files_attributes ||
      data.idea_images_attributes ||
      Object.values(data.body_multiloc).some((value) => value.includes('<img'));

    setFormData(data);
    if (disclaimerNeeded) {
      return setIsDisclaimerOpened(true);
    } else {
      return onSubmit(data);
    }
  };

  const onAcceptDisclaimer = () => {
    if (!formData) return;
    onSubmit(formData);
    setIsDisclaimerOpened(false);
  };

  const onCancelDisclaimer = () => {
    setIsDisclaimerOpened(false);
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const location_point_geojson = await getLocationGeojson(
      initialFormData,
      data
    );

    // If the user is an admin or project moderator, we allow them to post to a specific phase
    const phase_ids =
      phaseId && canModerateProject(project.data, authUser) ? [phaseId] : null;

    const idea = await addIdea({
      ...data,
      location_point_geojson,
      project_id: project.data.id,
      phase_ids,
      anonymous: postAnonymously ? true : undefined,
    });

    const ideaId = idea.data.id;
    participationMethodConfig?.onFormSubmission({
      project: project.data,
      ideaId,
      idea,
    });
    setLoading(false);
  };

  const getApiErrorMessage: ApiErrorGetter = useCallback(
    (error) => {
      return (
        messages[`api_error_${uiSchema?.options?.inputTerm}_${error}`] ||
        messages[`api_error_${error}`] ||
        messages[`api_error_invalid`]
      );
    },
    [uiSchema]
  );

  const getAjvErrorMessage: AjvErrorGetter = useCallback(
    (error, uischema) => {
      return (
        messages[
          `ajv_error_${uiSchema?.options?.inputTerm}_${
            getFieldNameFromPath(error.instancePath) ||
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            error?.params?.missingProperty
          }_${error.keyword}`
        ] ||
        messages[
          `ajv_error_${
            getFieldNameFromPath(error.instancePath) ||
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            error?.params?.missingProperty
          }_${error.keyword}`
        ] ||
        messages[
          `ajv_error_${uischema?.options?.input_type}_${error.keyword}`
        ] ||
        undefined
      );
    },
    [uiSchema]
  );

  const handleOnChangeAnonymousPosting = () => {
    if (!postAnonymously) {
      setShowAnonymousConfirmationModal(true);
    }

    setPostAnonymously((postAnonymously) => !postAnonymously);
  };

  const goBackToProject = useCallback(() => {
    clHistory.push(`/projects/${project.data.attributes.slug}`);
  }, [project]);

  if (isLoadingInputSchema) return <FullPageSpinner />;
  if (
    // inputSchemaError should display an error page instead
    inputSchemaError ||
    !participationMethodConfig ||
    !schema ||
    !uiSchema ||
    processingLocation
  ) {
    return null;
  }

  return (
    <>
      <IdeasNewMeta />
      <Box bg={colors.grey100}>
        <Box p="32px" display="flex" justifyContent="flex-start">
          <GoBackButtonSolid
            text={localize(project.data.attributes.title_multiloc)}
            onClick={goBackToProject}
          />
        </Box>
        <main id="e2e-idea-new-page">
          <PageContainer overflow="hidden">
            <Form
              schema={schema}
              uiSchema={uiSchema}
              onSubmit={handleDisclaimer}
              initialFormData={initialFormData}
              getAjvErrorMessage={getAjvErrorMessage}
              getApiErrorMessage={getApiErrorMessage}
              loading={loading}
              title={
                participationMethodConfig.getFormTitle ? (
                  <Box mb="40px">
                    <NewIdeaHeading
                      titleText={participationMethodConfig.getFormTitle({
                        project: project.data,
                        phases: phases?.data,
                        phaseFromUrl: phaseFromUrl?.data,
                      })}
                    />
                  </Box>
                ) : undefined
              }
              config={'input'}
              footer={
                allowAnonymousPosting ? (
                  <Suspense fallback={null}>
                    <ProfileVisiblity
                      postAnonymously={postAnonymously}
                      onChange={handleOnChangeAnonymousPosting}
                    />
                  </Suspense>
                ) : undefined
              }
            />
          </PageContainer>
          {showAnonymousConfirmationModal && (
            <AnonymousParticipationConfirmationModal
              onCloseModal={() => {
                setShowAnonymousConfirmationModal(false);
              }}
            />
          )}
          <ContentUploadDisclaimer
            isDisclaimerOpened={isDisclaimerOpened}
            onAcceptDisclaimer={onAcceptDisclaimer}
            onCancelDisclaimer={onCancelDisclaimer}
          />
        </main>
      </Box>
    </>
  );
};

export default IdeasNewIdeationForm;
