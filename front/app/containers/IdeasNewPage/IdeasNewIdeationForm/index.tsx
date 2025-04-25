import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';
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

import useFeatureFlag from 'hooks/useFeatureFlag';
import useInputSchema from 'hooks/useInputSchema';
import useLocale from 'hooks/useLocale';

import NewIdeaHeading from 'containers/IdeaHeading/NewIdeaHeading';
import InputDetailView from 'containers/IdeasNewPage/SimilarInputs/InputDetailView';
import { InputSelectContext } from 'containers/IdeasNewPage/SimilarInputs/InputSelectContext';
import { calculateDynamicHeight } from 'containers/IdeasNewSurveyPage/IdeasNewSurveyForm/utils';

import ContentUploadDisclaimer from 'components/ContentUploadDisclaimer';
import Form from 'components/Form';
import { FORM_PAGE_CHANGE_EVENT } from 'components/Form/Components/Layouts/events';
import { AjvErrorGetter, ApiErrorGetter } from 'components/Form/typings';
import FullPageSpinner from 'components/UI/FullPageSpinner';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';
import { reverseGeocode } from 'utils/locationTools';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import IdeasNewMeta from '../IdeasNewMeta';
import messages from '../messages';
import { getLocationGeojson } from '../utils';

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
  const locale = useLocale();
  const [isDisclaimerOpened, setIsDisclaimerOpened] = useState(false);
  const [formData, setFormData] = useState<FormValues | null>(null);
  const callbackRef = useRef<(() => void) | null>(null);
  const { mutateAsync: addIdea } = useAddIdea();
  const { data: authUser } = useAuthUser();
  const { data: phases } = usePhases(project.data.id);
  const { data: phaseFromUrl } = usePhase(phaseId);
  const isSmallerThanPhone = useBreakpoint('phone');
  const [usingMapView, setUsingMapView] = useState(false);
  const isAuthoringAssistanceEnabled = useFeatureFlag({
    name: 'input_iq',
  });
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
  const [processingLocation, setProcessingLocation] = useState(false);
  const [initialFormData, setInitialFormData] = useState({});
  const participationMethodConfig = getConfig(phaseFromUrl?.data, phases);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const handleCloseDetail = () => {
    setSelectedIdeaId(null);
  };
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const showSimilarInputs = !!(
    phaseFromUrl?.data.attributes.similarity_enabled &&
    isAuthoringAssistanceEnabled
  );

  // Parse the latitude and longitude from the URL query parameters once using useMemo.
  // This ensures that the geocoding effect only triggers if these specific values (or locale) change,
  // avoiding unnecessary re-executions when unrelated parts of the URL update.
  const { lat, lng } = useMemo(() => {
    const parsed = parse(search, {
      ignoreQueryPrefix: true,
      decoder: (str, _defaultEncoder, _charset, type) =>
        type === 'value' ? parseFloat(str) : str,
    }) as { [key: string]: string | number };
    return {
      lat: typeof parsed.lat === 'number' ? parsed.lat : undefined,
      lng: typeof parsed.lng === 'number' ? parsed.lng : undefined,
    };
  }, [search]);

  useEffect(() => {
    if (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNilOrError(locale)
    ) {
      setProcessingLocation(true);
      // Click on map flow : Reverse geocode the location if it's in the url params
      reverseGeocode(lat, lng, locale).then((address) => {
        setInitialFormData((prevFormData) => ({
          ...prevFormData,
          location_description: address,
          location_point_geojson: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        }));
        setProcessingLocation(false);
      });
    }
  }, [lat, lng, locale]);

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(FORM_PAGE_CHANGE_EVENT)
      .subscribe(() => {
        setUsingMapView(!!document.getElementById('map_page'));
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle image disclaimer
  const handleDisclaimer = (
    data: FormValues,
    onSubmitCallback?: () => void
  ) => {
    const disclaimerNeeded =
      data.idea_files_attributes ||
      data.idea_images_attributes ||
      Object.values(data.body_multiloc).some((value) => value.includes('<img'));

    setFormData(data);

    if (data.publication_status === 'published') {
      if (disclaimerNeeded) {
        callbackRef.current = onSubmitCallback || null;
        return setIsDisclaimerOpened(true);
      }
      return onSubmit(data, onSubmitCallback);
    } else {
      // Add handling draft ideas
    }
  };

  const onAcceptDisclaimer = () => {
    if (!formData) return;
    onSubmit(formData);
    setIsDisclaimerOpened(false);
    callbackRef.current?.();
    callbackRef.current = null;
  };

  const onCancelDisclaimer = () => {
    setIsDisclaimerOpened(false);
  };

  const onSubmit = async (data: FormValues, onSubmitCallback?: () => void) => {
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
      publication_status: undefined, // TODO: Change this logic when handling draft ideas
    });
    updateSearchParams({ idea_id: idea.data.id });
    onSubmitCallback?.();
    setLoading(false);
    return idea;
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

  if (isLoadingInputSchema) return <FullPageSpinner />;
  if (
    // inputSchemaError should display an error page instead
    inputSchemaError ||
    !participationMethodConfig ||
    !phaseId ||
    !schema ||
    !uiSchema ||
    processingLocation
  ) {
    return null;
  }

  const titleText = participationMethodConfig.getFormTitle?.({
    project: project.data,
    phases: phases?.data,
    phaseFromUrl: phaseFromUrl?.data,
  });
  const maxWidth = usingMapView ? '1100px' : '700px';

  return (
    <>
      <IdeasNewMeta />
      <Box
        w="100%"
        bgColor={colors.grey100}
        h="100vh"
        position="fixed"
        zIndex="1010"
        overflow="hidden"
      >
        <Box display="flex" flexDirection="row" h="100%" w="100%">
          <Box
            flex="1"
            display="flex"
            mx="auto"
            justifyContent="center"
            w="100%"
          >
            <Box w="100%" maxWidth={maxWidth}>
              <Box
                w="100%"
                position="relative"
                top={isSmallerThanPhone ? '0' : '40px'}
              >
                <NewIdeaHeading phaseId={phaseId} titleText={titleText} />
              </Box>
              <main id="e2e-idea-new-page">
                <Box
                  display="flex"
                  justifyContent="center"
                  pt={isSmallerThanPhone ? '0' : '40px'}
                  w="100%"
                >
                  <Box
                    background={colors.white}
                    maxWidth={maxWidth}
                    w="100%"
                    h={calculateDynamicHeight(isSmallerThanPhone)}
                    pb={isSmallerThanPhone ? '0' : '80px'}
                    display="flex"
                  >
                    <InputSelectContext.Provider
                      value={{
                        onIdeaSelect: setSelectedIdeaId,
                        title,
                        body,
                        setTitle,
                        setBody,
                        selectedIdeaId,
                        showSimilarInputs,
                      }}
                    >
                      <Form
                        schema={schema}
                        uiSchema={uiSchema}
                        onSubmit={handleDisclaimer}
                        initialFormData={initialFormData}
                        getAjvErrorMessage={getAjvErrorMessage}
                        getApiErrorMessage={getApiErrorMessage}
                        loading={loading}
                        showSubmitButton={false}
                        config={'input'}
                      />
                    </InputSelectContext.Provider>
                  </Box>
                </Box>
                <ContentUploadDisclaimer
                  isDisclaimerOpened={isDisclaimerOpened}
                  onAcceptDisclaimer={onAcceptDisclaimer}
                  onCancelDisclaimer={onCancelDisclaimer}
                />
              </main>
            </Box>

            {selectedIdeaId &&
              (isSmallerThanPhone ? (
                <Box
                  position="fixed"
                  top="0"
                  left="0"
                  width="100%"
                  height="100%"
                  bg="rgba(0,0,0,0.4)"
                  zIndex="2000"
                  onClick={handleCloseDetail}
                >
                  <Box
                    position="absolute"
                    bottom="0"
                    width="100%"
                    height="75%"
                    bgColor={colors.white}
                    borderRadius="16px 16px 0 0"
                    overflowY="auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Box
                      width="40px"
                      height="4px"
                      bgColor={colors.grey300}
                      borderRadius="2px"
                      m="8px auto"
                    />
                    <InputDetailView ideaId={selectedIdeaId} />
                  </Box>
                </Box>
              ) : (
                <Box
                  top="40px"
                  width="375px"
                  minWidth="375px"
                  borderLeft={`1px solid ${colors.grey300}`}
                  overflowY="auto"
                  bgColor={colors.white}
                  position="relative"
                  mb="80px"
                >
                  <InputDetailView ideaId={selectedIdeaId} />
                </Box>
              ))}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default IdeasNewIdeationForm;
