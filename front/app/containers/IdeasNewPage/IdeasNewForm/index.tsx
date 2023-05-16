import React, { useEffect, useState, useCallback } from 'react';

import { isRegularUser } from 'services/permissions/roles';
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

import { isError, isNilOrError } from 'utils/helperUtils';
import useAuthUser from 'hooks/useAuthUser';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import usePhases, { TPhases } from 'hooks/usePhases';
import usePhase, { TPhase } from 'hooks/usePhase';
import useInputSchema from 'hooks/useInputSchema';
import { useParams, useSearchParams } from 'react-router-dom';
import useAddIdea from 'api/ideas/useAddIdea';

// i18n
import { useIntl } from 'utils/cl-intl';
import pageMessages from '../messages';
import messages from './messages';

// components
import Form, { AjvErrorGetter, ApiErrorGetter } from 'components/Form';
import IdeasNewMeta from '../IdeasNewMeta';
import PageContainer from 'components/UI/PageContainer';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import { Heading } from './Heading';
import {
  Box,
  Text,
  Checkbox,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

import { geocode, reverseGeocode } from 'utils/locationTools';

// for getting inital state from previous page
import { parse } from 'qs';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';
import { getCurrentPhase } from 'services/phases';
import {
  ParticipationMethodConfig,
  getMethodConfig,
} from 'utils/participationMethodUtils';
import { getLocationGeojson } from '../utils';
import { IProject } from 'api/projects/types';

const getConfig = (
  phaseFromUrl: TPhase,
  phases: TPhases,
  project: IProject | undefined
) => {
  let config: ParticipationMethodConfig | null | undefined = null;

  if (!isNilOrError(phaseFromUrl)) {
    config = getMethodConfig(phaseFromUrl.attributes.participation_method);
  } else {
    if (phases && project?.data.attributes.process_type === 'timeline') {
      const participationMethod =
        getCurrentPhase(phases)?.attributes.participation_method;
      if (!isNilOrError(participationMethod)) {
        config = getMethodConfig(participationMethod);
      }
    } else if (!isNilOrError(project)) {
      config = getMethodConfig(project.data.attributes.participation_method);
    }
  }

  return config;
};

const IdeasNewPageWithJSONForm = () => {
  const { mutate: addIdea } = useAddIdea();
  const params = useParams<{ slug: string }>();
  // const previousPathName = useContext(PreviousPathnameContext);
  const authUser = useAuthUser();
  const { data: project } = useProjectBySlug(params.slug);
  const [queryParams] = useSearchParams();
  const phaseId = queryParams.get('phase_id');
  const { formatMessage } = useIntl();

  const phases = usePhases(project?.data.id);
  const { schema, uiSchema, inputSchemaError } = useInputSchema({
    projectId: project?.data.id,
    phaseId,
  });

  const search = location.search;

  const [processingLocation, setProcessingLocation] = useState(false);
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

  const onSubmit = async (data) => {
    let location_point_geojson;

    if (data.location_description && !data.location_point_geojson) {
      location_point_geojson = await geocode(data.location_description);
    }

    location_point_geojson = await getLocationGeojson(initialFormData, data);
    addIdea(
      {
        ...data,
        location_point_geojson,
        project_id: project?.data.id,
        publication_status: 'published',
        phase_ids:
          phaseId &&
          !isNilOrError(authUser) &&
          !isRegularUser({ data: authUser })
            ? [phaseId]
            : null,
        anonymous: postAnonymously,
      },
      {
        onSuccess: (idea) => {
          const ideaId = idea.data.id;

          // Check ParticipationMethodConfig for form submission action
          if (
            project?.data.attributes.process_type === 'timeline' &&
            !isNilOrError(phases)
          ) {
            // Check if URL contains specific phase_id
            const phaseUsed =
              phases.find((phase) => phase.id === phaseId) ||
              getCurrentPhase(phases);
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
        },
      }
    );
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

  const togglePostAnonymously = () => {
    setPostAnonymously((v) => !v);
  };

  // get participation method config
  const phaseFromUrl = usePhase(phaseId);
  const config = getConfig(phaseFromUrl, phases, project);

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
                      phases,
                      phaseFromUrl,
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
            formSubmitText={isSurvey ? pageMessages.submitSurvey : undefined}
            footer={
              <Box mt="-20px" mb="60px">
                <Text fontWeight="bold">
                  {formatMessage(messages.profileVisiblity)}
                  <IconTooltip
                    content={
                      <Text color="white" fontSize="s" m="0">
                        {formatMessage(messages.inputsAssociatedWithProfile)}
                      </Text>
                    }
                    iconSize="16px"
                    placement="top-start"
                    display="inline"
                    ml="4px"
                    transform="translateY(-1px)"
                  />
                </Text>
                <Checkbox
                  checked={postAnonymously}
                  label={formatMessage(messages.postAnonymously)}
                  onChange={togglePostAnonymously}
                />
              </Box>
            }
          />
        </>
      ) : isError(project) || inputSchemaError ? null : (
        <FullPageSpinner />
      )}
    </PageContainer>
  );
};

export default IdeasNewPageWithJSONForm;
