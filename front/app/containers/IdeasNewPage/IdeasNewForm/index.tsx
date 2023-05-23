import React, { useEffect, useState, useCallback } from 'react';

// api
import { isRegularUser } from 'services/permissions/roles';
import { canModerateProject } from 'services/permissions/rules/projectPermissions';
import useAuthUser from 'hooks/useAuthUser';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import usePhases from 'api/phases/usePhases';
import usePhase from 'api/phases/usePhase';
import useInputSchema from 'hooks/useInputSchema';
import { useParams, useSearchParams } from 'react-router-dom';
import useAddIdea from 'api/ideas/useAddIdea';

// Cookies
import {
  setCookieAnonymousConfirmation,
  getCookieAnonymousConfirmation,
} from 'components/AnonymousParticipationConfirmationModal/AnonymousCookieManagement';

// i18n
import messages from '../messages';

// components
import Form, { AjvErrorGetter, ApiErrorGetter } from 'components/Form';
import IdeasNewMeta from '../IdeasNewMeta';
import PageContainer from 'components/UI/PageContainer';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import { Heading } from './Heading';
import { Box } from '@citizenlab/cl2-component-library';
import ProfileVisiblity from 'components/ProfileVisibility';
import AnonymousParticipationConfirmationModal from 'components/AnonymousParticipationConfirmationModal';

// utils
import { geocode, reverseGeocode } from 'utils/locationTools';
import {
  ParticipationMethodConfig,
  getMethodConfig,
} from 'utils/participationMethodUtils';
import { getLocationGeojson } from '../utils';
import { isError, isNilOrError } from 'utils/helperUtils';
import { getCurrentPhase } from 'api/phases/utils';
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
  let config: ParticipationMethodConfig | null | undefined = null;

  if (!isNilOrError(phaseFromUrl)) {
    config = getMethodConfig(phaseFromUrl.attributes.participation_method);
  } else {
    if (phases && project?.data.attributes.process_type === 'timeline') {
      const participationMethod = getCurrentPhase(phases?.data)?.attributes
        .participation_method;
      if (!isNilOrError(participationMethod)) {
        config = getMethodConfig(participationMethod);
      }
    } else if (!isNilOrError(project)) {
      config = getMethodConfig(project.data.attributes.participation_method);
    }
  }

  return config;
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
  const params = useParams<{ slug: string }>();
  const authUser = useAuthUser();
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
  const [formDataOnSubmit, setFormDataOnSubmit] = useState<
    FormValues | undefined
  >(undefined);
  const [initialFormData, setInitialFormData] = useState({});
  const [postAnonymously, setPostAnonymously] = useState(false);

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

  const onSubmit = async (data: FormValues) => {
    if (!project) return;

    setFormDataOnSubmit(data);

    const hasAnonymousConfirmationCookie = getCookieAnonymousConfirmation();
    if (
      project.data.attributes.allow_anonymous_participation &&
      postAnonymously &&
      !hasAnonymousConfirmationCookie
    ) {
      setShowAnonymousConfirmationModal(true);
    } else {
      continueSubmission(data);
    }
  };

  const continueSubmission = async (data: FormValues | undefined) => {
    if (!project || !data) {
      setShowAnonymousConfirmationModal(false);
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
        phaseId && !isNilOrError(authUser) && !isRegularUser({ data: authUser })
          ? [phaseId]
          : null,
      anonymous: postAnonymously ? true : undefined,
    });

    const ideaId = idea.data.id;

    // Check ParticipationMethodConfig for form submission action
    if (project?.data.attributes.process_type === 'timeline' && phases) {
      // Check if URL contains specific phase_id
      const phaseUsed =
        phases.data.find((phase) => phase.id === phaseId) ||
        getCurrentPhase(phases.data);
      if (!isNilOrError(phaseUsed)) {
        getMethodConfig(
          phaseUsed?.attributes?.participation_method
        ).onFormSubmission({
          project: project.data,
          ideaId,
          idea,
          phaseId: phaseUsed.id,
        });
      }
    } else if (!isNilOrError(project)) {
      getMethodConfig(
        project?.data.attributes.participation_method
      ).onFormSubmission({ project: project.data, ideaId, idea });
    }
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

  // get participation method config
  const { data: phaseFromUrl } = usePhase(phaseId);
  const config = getConfig(phaseFromUrl?.data, phases, project);

  if (isNilOrError(project) || !config) {
    return null;
  }

  const canUserEditProject =
    !isNilOrError(authUser) &&
    canModerateProject(project.data.id, { data: authUser });
  const isSurvey = config.postType === 'nativeSurvey';

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
            }
            config={isSurvey ? 'survey' : 'input'}
            formSubmitText={isSurvey ? messages.submitSurvey : undefined}
            footer={
              !isSurvey &&
              project.data.attributes.allow_anonymous_participation ? (
                <Box
                  p="40px"
                  mb="20px"
                  boxShadow="0px 2px 4px -1px rgba(0,0,0,0.06)"
                  borderRadius="3px"
                  width="100%"
                  background="white"
                >
                  <Box mt="-20px">
                    <ProfileVisiblity
                      postAnonymously={postAnonymously}
                      setPostAnonymously={setPostAnonymously}
                    />
                  </Box>
                </Box>
              ) : undefined
            }
          />
        </>
      ) : isError(project) || inputSchemaError ? null : (
        <FullPageSpinner />
      )}
      <AnonymousParticipationConfirmationModal
        onConfirmAnonymousParticipation={() => {
          setCookieAnonymousConfirmation();
          setShowAnonymousConfirmationModal(false);
          continueSubmission(formDataOnSubmit);
        }}
        showAnonymousConfirmationModal={showAnonymousConfirmationModal}
        setShowAnonymousConfirmationModal={setShowAnonymousConfirmationModal}
      />
    </PageContainer>
  );
};

export default IdeasNewPageWithJSONForm;
