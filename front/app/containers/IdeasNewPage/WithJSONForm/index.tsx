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
import GoBackButton from 'containers/IdeasShow/GoBackButton';
import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';
import { FormattedMessage } from 'utils/cl-intl';
import { addIdea } from 'services/ideas';
import { geocode, reverseGeocode } from 'utils/locationTools';

// for getting inital state from previous page
import { parse } from 'qs';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';
import { getCurrentPhase } from 'services/phases';
import { getMethodConfig } from 'utils/participationMethodUtils';

// Test schemas to be removed
import { schema as iSchema } from './schema';
import { uiSchema as iUiSchema } from './uiSchema';

const IdeasNewPageWithJSONForm = ({ params }: WithRouterProps) => {
  const previousPathName = useContext(PreviousPathnameContext);
  const authUser = useAuthUser();
  const project = useProject({ projectSlug: params.slug });
  const [searchParams] = useSearchParams();
  const phaseId = searchParams.get('phase_id');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const openModal = () => {
    setShowLeaveModal(true);
  };
  const closeModal = () => {
    setShowLeaveModal(false);
  };

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

  const userCanEditProject =
    !isNilOrError(authUser) &&
    canModerateProject(project.id, { data: authUser });
  const isSurvey = config.postType === 'nativeSurvey';
  const canEditSurvey = userCanEditProject && isSurvey;

  const linkToSurveyBuilder = phaseId
    ? `/admin/projects/${project.id}/phases/${phaseId}/native-survey/edit`
    : `/admin/projects/${project.id}/native-survey/edit`;

  const TitleComponent = (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        display="flex"
        width="100%"
        flexDirection="row"
        justifyContent={canEditSurvey ? 'flex-end' : 'space-between'}
        mb="14px"
        alignItems="center"
        maxWidth="700px"
        px="20px"
      >
        {isSurvey ? (
          <Box
            data-cy="e2e-edit-survey-link"
            display="flex"
            flexDirection="row"
          >
            {canEditSurvey && (
              <Button
                icon="edit"
                linkTo={linkToSurveyBuilder}
                buttonStyle="text"
                textDecorationHover="underline"
                hidden={!userCanEditProject}
                padding="0"
              >
                <FormattedMessage {...messages.editSurvey} />
              </Button>
            )}
            <Button icon="close" buttonStyle="text" onClick={openModal} />
          </Box>
        ) : (
          <GoBackButton insideModal={false} projectId={project.id} />
        )}
      </Box>

      <Box>{config.getFormTitle({ project, phases, phaseFromUrl })}</Box>
      <Modal opened={showLeaveModal} close={closeModal}>
        <Box display="flex" flexDirection="column" width="100%" p="20px">
          <Box mb="40px">
            <Title variant="h3" color="primary">
              <FormattedMessage {...messages.leaveSurveyConfirmationQuestion} />
            </Title>
            <Text color="primary" fontSize="l">
              <FormattedMessage {...messages.leaveSurveyMessage} />
            </Text>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            width="100%"
            alignItems="center"
          >
            <Button
              icon="delete"
              data-cy="e2e-confirm-delete-survey-results"
              buttonStyle="delete"
              width="auto"
              mr="20px"
              onClick={() => {
                clHistory.push(`/projects/${project.attributes.slug}`);
              }}
            >
              <FormattedMessage {...messages.confirmLeaveSurveyButtonText} />
            </Button>
            <Button buttonStyle="secondary" width="auto" onClick={closeModal}>
              <FormattedMessage {...messages.cancelLeaveSurveyButtonText} />
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );

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
            // schema={schema}
            // uiSchema={uiSchema}
            schema={iSchema}
            uiSchema={iUiSchema}
            onSubmit={onSubmit}
            initialFormData={initialFormData}
            getAjvErrorMessage={getAjvErrorMessage}
            getApiErrorMessage={getApiErrorMessage}
            inputId={undefined}
            title={TitleComponent}
            config={'input'}
          />
        </>
      ) : isError(project) || inputSchemaError ? null : (
        <FullPageSpinner />
      )}
    </PageContainer>
  );
};

export default IdeasNewPageWithJSONForm;
