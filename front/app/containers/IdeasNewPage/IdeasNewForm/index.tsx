import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';

// api
import { isRegularUser } from 'utils/permissions/roles';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import useAuthUser from 'api/me/useAuthUser';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import usePhases from 'api/phases/usePhases';
import usePhase from 'api/phases/usePhase';
import useInputSchema from 'hooks/useInputSchema';
import { useParams, useSearchParams } from 'react-router-dom';
import useAddIdea from 'api/ideas/useAddIdea';

// i18n
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

// components
import Form, { AjvErrorGetter, ApiErrorGetter } from 'components/Form';
import IdeasNewMeta from '../IdeasNewMeta';
import PageContainer from 'components/UI/PageContainer';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import { Heading } from './Heading';
import { Box } from '@citizenlab/cl2-component-library';
const ProfileVisiblity = lazy(() => import('./ProfileVisibility'));
import AnonymousParticipationConfirmationModal from 'components/AnonymousParticipationConfirmationModal';
import Warning from 'components/UI/Warning';

// utils
import { geocode, reverseGeocode } from 'utils/locationTools';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { getLocationGeojson } from '../utils';
import { isError, isNilOrError } from 'utils/helperUtils';
import { getCurrentParticipationContext } from 'api/phases/utils';
import { parse } from 'qs';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';

// types
import { Multiloc } from 'typings';
import { IPhases, IPhaseData } from 'api/phases/types';
import { IProject } from 'api/projects/types';

const getConfig = (
  phaseFromUrl: IPhaseData | undefined,
  phases: IPhases | undefined,
  project: IProject | undefined
) => {
  const participationMethod = phaseFromUrl
    ? phaseFromUrl.attributes.participation_method
    : getCurrentParticipationContext(project?.data, phases?.data)?.attributes
        .participation_method;

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
}

const IdeasNewPageWithJSONForm = () => {
  const { mutateAsync: addIdea } = useAddIdea();
  const { formatMessage } = useIntl();
  const params = useParams<{ slug: string }>();
  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectBySlug(params.slug);
  const [queryParams] = useSearchParams();
  const phaseId = queryParams.get('phase_id');

  const { data: phases } = usePhases(project?.data.id);
  const { schema, uiSchema, inputSchemaError } = useInputSchema({
    projectId: project?.data.id,
    phaseId,
  });

  const search = location.search;

  const [showAnonymousConfirmationModal, setShowAnonymousConfirmationModal] =
    useState(false);
  const [processingLocation, setProcessingLocation] = useState(false);
  const [initialFormData, setInitialFormData] = useState({});
  const [postAnonymously, setPostAnonymously] = useState(false);
  const participationContext = getCurrentParticipationContext(
    project?.data,
    phases?.data
  );
  const allowAnonymousPosting =
    participationContext?.attributes.allow_anonymous_participation;

  useEffect(() => {
    // Click on map flow :
    // clicked location is passed in url params
    // reverse goecode them and use them as initial data

    const { lat, lng } = parse(search, {
      ignoreQueryPrefix: true,
      decoder: (str, _defaultEncoder, _charset, type) => {
        return type === 'value' ? parseFloat(str) : str;
      },
    }) as { [key: string]: string | number };

    if (typeof lat === 'number' && typeof lng === 'number') {
      setProcessingLocation(true);
      reverseGeocode(lat, lng).then((address) => {
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
  }, [search]);

  // get participation method config
  const { data: phaseFromUrl } = usePhase(phaseId);
  const config = getConfig(phaseFromUrl?.data, phases, project);

  const onSubmit = async (data: FormValues) => {
    if (!project) {
      return;
    }

    let location_point_geojson;

    if (data.location_description && !data.location_point_geojson) {
      location_point_geojson = await geocode(data.location_description);
    } else {
      location_point_geojson = await getLocationGeojson(initialFormData, data);
    }

    const idea = await addIdea({
      ...data,
      location_point_geojson,
      project_id: project.data.id,
      publication_status: 'published',
      phase_ids:
        phaseId &&
        !isNilOrError(authUser) &&
        !isRegularUser({ data: authUser.data })
          ? [phaseId]
          : null,
      anonymous: postAnonymously ? true : undefined,
    });

    const ideaId = idea.data.id;
    config?.onFormSubmission({ project: project.data, ideaId, idea });
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
    (error) => {
      return (
        messages[
          `ajv_error_${uiSchema?.options?.inputTerm}_${
            getFieldNameFromPath(error.instancePath) ||
            error?.params?.missingProperty
          }_${error.keyword}`
        ] ||
        messages[
          `ajv_error_${
            getFieldNameFromPath(error.instancePath) ||
            error?.params?.missingProperty
          }_${error.keyword}`
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

  if (isNilOrError(project) || !config) {
    return null;
  }

  const canUserEditProject =
    !isNilOrError(authUser) &&
    canModerateProject(project.data.id, { data: authUser.data });

  const isSurvey = config.postType === 'nativeSurvey';
  const isAnonymousSurvey = isSurvey && allowAnonymousPosting;

  return (
    <PageContainer id="e2e-idea-new-page" overflow="hidden">
      {project && !processingLocation && schema && uiSchema && config ? (
        <>
          <IdeasNewMeta />
          <Form
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={onSubmit}
            initialFormData={initialFormData}
            getAjvErrorMessage={getAjvErrorMessage}
            getApiErrorMessage={getApiErrorMessage}
            inputId={undefined}
            title={
              <>
                <Heading
                  project={project.data}
                  titleText={
                    config.getFormTitle ? (
                      config.getFormTitle({
                        project: project.data,
                        phases: phases?.data,
                        phaseFromUrl: phaseFromUrl?.data,
                      })
                    ) : (
                      <></>
                    )
                  }
                  isSurvey={isSurvey}
                  canUserEditProject={canUserEditProject}
                />
                {isAnonymousSurvey && (
                  <Box mx="auto" p="20px" maxWidth="700px">
                    <Warning icon="shield-checkered">
                      {formatMessage(messages.anonymousSurveyMessage)}
                    </Warning>
                  </Box>
                )}
              </>
            }
            config={isSurvey ? 'survey' : 'input'}
            formSubmitText={isSurvey ? messages.submitSurvey : undefined}
            footer={
              !isSurvey && allowAnonymousPosting ? (
                <Suspense fallback={null}>
                  <ProfileVisiblity
                    postAnonymously={postAnonymously}
                    onChange={handleOnChangeAnonymousPosting}
                  />
                </Suspense>
              ) : undefined
            }
          />
        </>
      ) : isError(project) || inputSchemaError ? null : (
        <FullPageSpinner />
      )}
      {showAnonymousConfirmationModal && (
        <AnonymousParticipationConfirmationModal
          onCloseModal={() => {
            setShowAnonymousConfirmationModal(false);
          }}
        />
      )}
    </PageContainer>
  );
};

export default IdeasNewPageWithJSONForm;
