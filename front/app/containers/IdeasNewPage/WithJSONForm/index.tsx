import React, { useContext, useEffect, useState, useCallback } from 'react';
import { PreviousPathnameContext } from 'context';
import { useSearchParams } from 'react-router-dom';

import { WithRouterProps } from 'utils/cl-router/withRouter';
import clHistory from 'utils/cl-router/history';

import { isAdmin, isModerator, isSuperAdmin } from 'services/permissions/roles';
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

import { isError, isNilOrError } from 'utils/helperUtils';
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import usePhase from 'hooks/usePhase';
import useInputSchema from 'hooks/useInputSchema';

import messages from '../messages';

import IdeasNewMeta from '../IdeasNewMeta';
import Form, { AjvErrorGetter, ApiErrorGetter } from 'components/Form';

import PageContainer from 'components/UI/PageContainer';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import { Heading } from 'containers/IdeasNewPage/WithJSONForm/Heading';
import { addIdea } from 'services/ideas';
import { geocode, reverseGeocode } from 'utils/locationTools';

// for getting inital state from previous page
import { parse } from 'qs';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';
import { getCurrentPhase } from 'services/phases';
import { getMethodConfig } from 'utils/participationMethodUtils';

const IdeasNewPageWithJSONForm = ({ params }: WithRouterProps) => {
  const previousPathName = useContext(PreviousPathnameContext);
  const authUser = useAuthUser();
  const project = useProject({ projectSlug: params.slug });
  const [searchParams] = useSearchParams();
  const phaseId = searchParams.get('phase_id');

  const phases = usePhases(project?.id);
  const { schema, uiSchema, inputSchemaError } = useInputSchema({
    projectId: project?.id,
    phaseId,
  });

  useEffect(() => {
    const isPrivilegedUser =
      !isNilOrError(authUser) &&
      (isAdmin({ data: authUser }) ||
        isModerator({ data: authUser }) ||
        isSuperAdmin({ data: authUser }));

    if (
      !isPrivilegedUser &&
      !isNilOrError(project) &&
      !project.attributes.action_descriptor.posting_idea.enabled
    ) {
      clHistory.replace(previousPathName || (!authUser ? '/sign-up' : '/'));
    }
  }, [authUser, project, previousPathName]);

  const search = location.search;
  // Click on map flow :
  // clicked location is passed in url params
  // reverse goecode them and use them as initial data
  const [processingLocation, setProcessingLocation] = useState(false);
  const [initialFormData, setInitialFormData] = useState({});

  useEffect(() => {
    const { lat, lng } = parse(search, {
      ignoreQueryPrefix: true,
      decoder: (str, _defaultEncoder, _charset, type) => {
        return type === 'value' ? parseFloat(str) : str;
      },
    }) as { [key: string]: string | number };

    if (lat && lng) {
      setInitialFormData((initialFormData) => ({
        ...initialFormData,
        location_point_geojson: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      }));
    }

    if (typeof lat === 'number' && typeof lng === 'number') {
      setProcessingLocation(true);
      reverseGeocode(lat, lng).then((address) => {
        setInitialFormData((initialFormData) => ({
          ...initialFormData,
          location_description: address,
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
    const idea = await addIdea({
      ...data,
      location_point_geojson,
      project_id: project?.id,
      publication_status: 'published',
      phase_ids: phaseId ? [phaseId] : null,
    });
    const ideaId = idea.data.id;

    // Check ParticipationMethodConfig for form submission action
    if (
      project?.attributes.process_type === 'timeline' &&
      !isNilOrError(phases)
    ) {
      // Check if URL contains specific phase_id
      const queryParams = new URLSearchParams(window.location.search);
      const phaseIdFromUrl = queryParams.get('phase_id');
      const phaseUsed =
        phases.find((phase) => phase.id === phaseIdFromUrl) ||
        getCurrentPhase(phases);
      if (!isNilOrError(phaseUsed)) {
        getMethodConfig(
          phaseUsed?.attributes?.participation_method
        ).onFormSubmission({ project, ideaId, idea, phaseId: phaseUsed.id });
      }
    } else if (!isNilOrError(project)) {
      getMethodConfig(
        project?.attributes.participation_method
      ).onFormSubmission({ project, ideaId, idea });
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
  const phaseFromUrl = usePhase(phaseId);
  // TODO: Improve typings and remove any
  let config;

  if (!isNilOrError(phaseFromUrl)) {
    config = getMethodConfig(phaseFromUrl.attributes.participation_method);
  } else {
    if (phases && project?.attributes.process_type === 'timeline') {
      const participationMethod =
        getCurrentPhase(phases)?.attributes.participation_method;
      if (!isNilOrError(participationMethod)) {
        config = getMethodConfig(participationMethod);
      }
    } else if (!isNilOrError(project)) {
      config = getMethodConfig(project.attributes.participation_method);
    }
  }

  if (isNilOrError(project) || isNilOrError(config)) {
    return null;
  }

  const canUserEditProject =
    !isNilOrError(authUser) &&
    canModerateProject(project.id, { data: authUser });
  const isSurvey = config.postType === 'nativeSurvey';

  return (
    <PageContainer id="e2e-idea-new-page" overflow="hidden">
      {!isNilOrError(project) &&
      !processingLocation &&
      schema &&
      uiSchema &&
      config ? (
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
                project={project}
                titleText={config.getFormTitle({
                  project,
                  phases,
                  phaseFromUrl,
                })}
                isSurvey={isSurvey}
                canUserEditProject={canUserEditProject}
              />
            }
            config={'input'}
            formSubmitText={isSurvey ? messages.submitSurvey : undefined}
          />
        </>
      ) : isError(project) || inputSchemaError ? null : (
        <FullPageSpinner />
      )}
    </PageContainer>
  );
};

export default IdeasNewPageWithJSONForm;
