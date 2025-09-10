import React, { useState, useEffect, FormEvent, lazy } from 'react';

import {
  Box,
  IconTooltip,
  Input,
  Label,
  Spinner,
  Text,
  Title,
  Toggle,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { isEmpty, get, isError } from 'lodash-es';
import { useParams } from 'react-router-dom';
import { RouteType } from 'routes';
import { useTheme } from 'styled-components';
import { Multiloc, UploadFile } from 'typings';

import useAddEventImage from 'api/event_images/useAddEventImage';
import useDeleteEventImage from 'api/event_images/useDeleteEventImage';
import useEventImage from 'api/event_images/useEventImage';
import useUpdateEventImage from 'api/event_images/useUpdateEventImage';
import { IEvent, IEventProperties } from 'api/events/types';
import useAddEvent from 'api/events/useAddEvent';
import useEvent from 'api/events/useEvent';
import useUpdateEvent from 'api/events/useUpdateEvent';
import { IFileAttachmentData } from 'api/file_attachments/types';
import useFileAttachments from 'api/file_attachments/useFileAttachments';
import { IFileData } from 'api/files/types';
import useAddFile from 'api/files/useAddFile';

import { useSyncFiles } from 'hooks/files/useSyncFiles';
import useContainerWidthAndHeight from 'hooks/useContainerWidthAndHeight';
import useLocale from 'hooks/useLocale';

import projectMessages from 'containers/Admin/projects/project/general/messages';

import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import ErrorComponent from 'components/UI/Error';
import FileRepositorySelectAndUpload from 'components/UI/FileRepositorySelectAndUpload';
import GoBackButton from 'components/UI/GoBackButton';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import LocationInput, { Option } from 'components/UI/LocationInput';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import {
  convertUrlToUploadFile,
  generateTemporaryFileAttachment,
} from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import { geocode } from 'utils/locationTools';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import DateTimeSelection from './components/DateTimeSelection';
import messages from './messages';
import { SubmitState, ErrorType, ApiErrorType } from './types';
import { initializeEventTimes } from './utils';

const EventMap = lazy(() => import('./components/EventMap'));

const AdminProjectEventEdit = () => {
  const { id: eventId, projectId } = useParams();

  const isCreatingNewEvent = !eventId;

  const { width, containerRef } = useContainerWidthAndHeight();
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const locale = useLocale();

  const { mutate: addEvent } = useAddEvent();
  const { data: event, isInitialLoading } = useEvent(eventId);
  const { mutate: updateEvent } = useUpdateEvent();

  // event file attachments
  const syncEventFiles = useSyncFiles();
  const { mutate: addFile } = useAddFile();
  const { data: remoteEventFileAttachments } = useFileAttachments({
    attachable_id: event?.data.id,
    attachable_type: 'Event',
  });

  // event image
  const { mutate: addEventImage } = useAddEventImage();
  const { mutate: updateEventImage } = useUpdateEventImage();
  const { mutate: deleteEventImage } = useDeleteEventImage();
  const { data: remoteEventImage } = useEventImage(event?.data);

  // state
  const [errors, setErrors] = useState<ErrorType>({});
  const [apiErrors, setApiErrors] = useState<ApiErrorType>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [submitState, setSubmitState] = useState<SubmitState>('disabled');
  const [eventFileAttachments, setEventFileAttachments] = useState<
    IFileAttachmentData[]
  >(remoteEventFileAttachments?.data || []);
  const [croppedImgBase64, setCroppedImgBase64] = useState<string | null>(null);

  const [attributeDiff, setAttributeDiff] = useState<IEventProperties>(
    isCreatingNewEvent ? initializeEventTimes() : {}
  );

  const [registerButtonOptionsVisible, setRegisterButtonOptionsVisible] =
    useState(false);
  const [registrationLimitVisible, setRegistrationLimitVisible] =
    useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadFile | null>(null);
  const [locationPoint, setLocationPoint] = useState<GeoJSON.Point | null>(
    event?.data.attributes.location_point_geojson || null
  );
  const [geocodedPoint, setGeocodedPoint] = useState<GeoJSON.Point | null>(
    null
  );
  const [eventFileAttachmentsToRemove, setEventFileAttachmentsToRemove] =
    useState<IFileAttachmentData[]>([]);
  const [successfulGeocode, setSuccessfulGeocode] = useState(false);
  const [eventImageAltText, setEventImagealtText] = useState<Multiloc | null>(
    null
  );
  const [hasAltTextChanged, setHasAltTextChanged] = useState(false);

  // Remote values
  const remotePoint = event?.data.attributes.location_point_geojson;

  const eventAttrs = event
    ? // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      {
        ...event.data.attributes,
        ...attributeDiff,
      }
    : { ...attributeDiff };

  // Set image value to remote image if present
  useEffect(() => {
    async function convertRemoteImage() {
      if (remoteEventImage) {
        const imageUrl = remoteEventImage.data.attributes.versions.medium;
        const altTextValue = remoteEventImage.data.attributes.alt_text_multiloc;
        if (imageUrl) {
          const imageFile = await convertUrlToUploadFile(imageUrl);
          setUploadedImage(imageFile);
          setEventImagealtText(altTextValue);
          setHasAltTextChanged(false);
        }
      }
    }
    if (remoteEventImage) {
      convertRemoteImage();
    }
  }, [remoteEventImage]);

  // If there is already a remote point, set successful geocode value to true
  useEffect(() => {
    if (!isNilOrError(remotePoint)) {
      setLocationPoint(() => remotePoint);
      setSuccessfulGeocode(true);
    }
  }, [remotePoint]);

  useEffect(() => {
    if (typeof eventAttrs.maximum_attendees === 'number') {
      // If we have a maximum number of attendees, we want to ensure the toggle is on
      setRegistrationLimitVisible(true);
    }
  }, [eventAttrs.maximum_attendees]);

  // If there is a custom button url, set the state accordingly
  useEffect(() => {
    if (eventAttrs.using_url) {
      setRegisterButtonOptionsVisible(true);
    }
  }, [eventAttrs.using_url]);

  // When address 1 is updated, geocode the location point to match
  useEffect(() => {
    if (eventAttrs.address_1 !== event?.data.attributes.address_1) {
      const delayDebounceFn = setTimeout(async () => {
        const point = eventAttrs.address_1
          ? await geocode(eventAttrs.address_1)
          : null;
        setGeocodedPoint(point);
        setLocationPoint(point);
        setSuccessfulGeocode(!!point);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
    setSuccessfulGeocode(false);
    return;
  }, [eventAttrs.address_1, event]);

  // Set event file attachments to remote event file attachments
  useEffect(() => {
    if (!isNilOrError(remoteEventFileAttachments)) {
      setEventFileAttachments(remoteEventFileAttachments.data);
    }
  }, [remoteEventFileAttachments]);

  const handleTitleMultilocOnChange = (titleMultiloc: Multiloc) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      title_multiloc: titleMultiloc,
    });
  };

  const handleAddress2OnChange = (address2: Multiloc) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      address_2_multiloc: address2,
    });
  };

  const handleOnlineLinkOnChange = async (onlineLink: string) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      online_link: onlineLink,
    });
    setErrors({});
  };

  const handleAddress1OnChange = async (location: string) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      address_1: location,
    });
  };

  const handleDescriptionMultilocOnChange = (descriptionMultiloc: Multiloc) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      description_multiloc: descriptionMultiloc,
    });
  };

  const handleLimitToggleOnChange = (toggleValue: boolean) => {
    setSubmitState('enabled');
    setRegistrationLimitVisible(toggleValue);
    setAttributeDiff({
      ...attributeDiff,
      maximum_attendees: toggleValue === false ? null : 100,
    });
  };

  const handleMaximumRegistrantsChange = (maximum_attendees: string) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      // If maximum_attendees is an empty string, set it to 0.
      // Number('') returns 0.
      maximum_attendees: Number(maximum_attendees),
    });
    setErrors({});
  };

  const handleCustomButtonToggleOnChange = (toggleValue: boolean) => {
    setSubmitState('enabled');
    setRegisterButtonOptionsVisible(toggleValue);
    setAttributeDiff({
      ...attributeDiff,
      using_url: '',
    });
  };

  const handleCustomButtonMultilocOnChange = (buttonMultiloc: Multiloc) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      attend_button_multiloc: buttonMultiloc,
    });
  };

  const handleCustomButtonLinkOnChange = (url: string) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      using_url: url as RouteType,
    });
    setErrors({});
  };

  const handleDateTimePickerOnChange = (
    value: React.SetStateAction<IEventProperties>
  ) => {
    setSubmitState('enabled');
    setAttributeDiff(value);
    setErrors({});
  };

  const handleOnImageAdd = (imageFiles: UploadFile[]) => {
    setSubmitState('enabled');
    setUploadedImage(imageFiles[0]);
    setCroppedImgBase64(imageFiles[0].base64);
  };

  const handleOnImageRemove = () => {
    setSubmitState('enabled');
    setUploadedImage(null);
  };

  const handleEventFileOnAdd = (fileToAdd: UploadFile) => {
    // Upload the file to the Data Repository, so we can make the attachment later.
    addFile(
      {
        content: fileToAdd.base64,
        project: projectId,
        name: fileToAdd.name,
        category: 'other', // Default to 'other' when added from phase setup
        ai_processing_allowed: false, // Default to false when added from phase setup
      },
      {
        onSuccess: (newFile) => {
          // Create a temporary file attachment to add to the state, so the user sees it in the list.
          const temporaryFileAttachment = generateTemporaryFileAttachment({
            fileId: newFile.data.id,
            attachableId: eventId,
            attachableType: 'Event',
            position: eventFileAttachments.length,
          });

          const isDuplicate = eventFileAttachments.some((fileAttachment) => {
            return (
              fileAttachment.relationships.file.data.id ===
              temporaryFileAttachment.relationships.file.data.id
            );
          });

          setEventFileAttachments(
            isDuplicate
              ? eventFileAttachments
              : [...eventFileAttachments, temporaryFileAttachment]
          );

          setSubmitState(isDuplicate ? submitState : 'enabled');
        },
      }
    );
  };

  const handleEventFileOnRemove = (
    eventFileAttachmentToRemove: IFileAttachmentData
  ) => {
    setSubmitState('enabled');
    setEventFileAttachmentsToRemove([
      ...eventFileAttachmentsToRemove,
      eventFileAttachmentToRemove,
    ]);
    setEventFileAttachments(
      eventFileAttachments.filter(
        (eventFileAttachment) =>
          eventFileAttachment.id !== eventFileAttachmentToRemove.id
      )
    );
  };

  const handleFilesReorder = (
    updatedFileAttachments: IFileAttachmentData[]
  ) => {
    // Update the position of the updated file attachments
    const updatedFileAttachmentsWithPosition = updatedFileAttachments.map(
      (fileAttachment, index) => ({
        ...fileAttachment,
        attributes: {
          ...fileAttachment.attributes,
          position: index,
        },
      })
    );

    setEventFileAttachments(updatedFileAttachmentsWithPosition);
    setSubmitState('enabled');
  };

  const handleEventFileOnAttach = (file: IFileData) => {
    const isDuplicate = eventFileAttachments.some((fileAttachment) => {
      return fileAttachment.relationships.file.data.id === file.id;
    });

    if (isDuplicate) return;

    const temporaryFileAttachment = generateTemporaryFileAttachment({
      fileId: file.id,
      attachableId: eventId,
      attachableType: 'Phase',
      position: eventFileAttachments.length,
    });

    setEventFileAttachments((eventFileAttachments) => [
      ...eventFileAttachments,
      temporaryFileAttachment,
    ]);
    setSubmitState('enabled');
  };

  const addOrDeleteEventImage = async (data: IEvent) => {
    const hasRemoteImage = !isNilOrError(remoteEventImage);
    const remoteImageId = hasRemoteImage
      ? event?.data.relationships.event_images.data[0].id
      : undefined;
    if (
      (uploadedImage === null || !uploadedImage.remote) &&
      hasRemoteImage &&
      remoteImageId &&
      eventId
    ) {
      deleteEventImage({
        eventId,
        imageId: remoteImageId,
      });
    }
    if (uploadedImage && croppedImgBase64 && !uploadedImage.remote) {
      addEventImage({
        eventId: data.data.id,
        image: {
          image: croppedImgBase64 || '',
          ...(eventImageAltText
            ? { alt_text_multiloc: eventImageAltText }
            : {}),
        },
      });
    }
  };

  const updateImage = async (data: IEvent) => {
    const hasRemoteImage = !isNilOrError(remoteEventImage);
    const remoteImageId = hasRemoteImage
      ? event?.data.relationships.event_images.data[0].id
      : undefined;

    if (remoteImageId && uploadedImage && eventImageAltText) {
      updateEventImage({
        eventId: data.data.id,
        imageId: remoteImageId,
        image: {
          image: uploadedImage.base64,
          alt_text_multiloc: eventImageAltText,
        },
      });
    }
  };

  const handleOnSubmit = async (e: FormEvent) => {
    const locationPointChanged =
      locationPoint !== event?.data.attributes.location_point_geojson;
    const locationPointUpdated =
      eventAttrs.address_1 || successfulGeocode ? locationPoint : null;

    const imageChanged =
      (uploadedImage !== null && !uploadedImage.remote) ||
      (uploadedImage === null && remoteEventImage !== undefined);

    e.preventDefault();
    try {
      setSaving(true);

      // Handle event file attachments
      const initialFileAttachmentOrdering: Record<string, number | undefined> =
        Object.fromEntries(
          remoteEventFileAttachments?.data
            .filter((file) => file.id)
            .map((file) => [file.id!, file.attributes.position]) ?? []
        );

      syncEventFiles({
        attachableId: eventId || '',
        attachableType: 'Event',
        fileAttachments: eventFileAttachments,
        fileAttachmentsToRemove: [], // eventFilesToRemove --- IGNORE ---
        fileAttachmentOrdering: initialFileAttachmentOrdering,
      });

      // If only image has changed
      if (isEmpty(attributeDiff) && imageChanged && event) {
        addOrDeleteEventImage(event);
      }

      if (hasAltTextChanged && !imageChanged && event) {
        updateImage(event);
      }

      // non-file input fields have changed
      if (!isEmpty(attributeDiff) || locationPointChanged) {
        // event already exists (in the state)
        if (event) {
          updateEvent(
            {
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              eventId: event?.data.id,
              event: {
                ...attributeDiff,
                location_point_geojson: locationPointChanged
                  ? locationPointUpdated
                  : // TODO: Fix this the next time the file is edited.
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    event?.data.attributes.location_point_geojson,
              },
            },
            {
              onSuccess: async (data) => {
                addOrDeleteEventImage(data);
                setSubmitState('success');
              },
              onError: async (errors) => {
                setSaving(false);
                setErrors(errors.errors);
                setSubmitState('error');
              },
            }
          );
        } else if (projectId) {
          // event doesn't exist, create with project id
          addEvent(
            {
              projectId,
              event: {
                ...attributeDiff,
                location_point_geojson: locationPointUpdated || null,
              },
            },
            {
              onSuccess: async (data) => {
                setSubmitState('success');
                addOrDeleteEventImage(data);
                clHistory.push(`/admin/projects/${projectId}/events`);
              },
              onError: async (errors) => {
                setSaving(false);
                setErrors(errors.errors);
                setSubmitState('error');
              },
            }
          );
        }
      }
      setSaving(false);
    } catch (errors) {
      if (errors?.errors) {
        setSaving(false);
        setApiErrors(errors.errors);
        setSubmitState('error');
      } else {
        setSaving(false);
        setSubmitState('error');
      }
    }
  };

  const handleEventImageAltTextChange = (altTextMultiloc: Multiloc) => {
    setSubmitState('enabled');
    setEventImagealtText(altTextMultiloc);
    setHasAltTextChanged(true);
  };

  const handleImageCropChange = (imgBase64: string) => {
    setCroppedImgBase64(imgBase64);
  };

  if (event !== undefined && isInitialLoading) {
    return <Spinner />;
  }

  const imageShouldBeSaved = uploadedImage ? !uploadedImage.remote : false;

  return (
    <Box mt="44px" mx="44px">
      <Box bg={colors.white} borderRadius={stylingConsts.borderRadius} p="44px">
        <GoBackButton linkTo={`/admin/projects/${projectId}/events`} />
        <Box ref={containerRef}>
          <SectionTitle>
            {event && <FormattedMessage {...messages.editEventTitle} />}
            {!event && <FormattedMessage {...messages.newEventTitle} />}
          </SectionTitle>

          <form className="e2e-project-event-edit" onSubmit={handleOnSubmit}>
            <Section>
              <SectionField>
                <InputMultilocWithLocaleSwitcher
                  id="title"
                  label={<FormattedMessage {...messages.titleLabel} />}
                  type="text"
                  valueMultiloc={eventAttrs.title_multiloc}
                  onChange={handleTitleMultilocOnChange}
                />
                <ErrorComponent apiErrors={get(errors, 'title_multiloc')} />
              </SectionField>

              <SectionField className="fullWidth">
                <Box width="860px">
                  <QuillMultilocWithLocaleSwitcher
                    id="description"
                    label={<FormattedMessage {...messages.descriptionLabel} />}
                    valueMultiloc={eventAttrs.description_multiloc}
                    onChange={handleDescriptionMultilocOnChange}
                    withCTAButton
                  />
                </Box>
                <ErrorComponent
                  apiErrors={get(errors, 'description_multiloc')}
                />
              </SectionField>
              <SectionField>
                <Label>{formatMessage(messages.eventImage)}</Label>

                {!imageShouldBeSaved && (
                  <ImagesDropzone
                    images={uploadedImage ? [uploadedImage] : []}
                    maxImagePreviewWidth="360px"
                    objectFit="contain"
                    acceptedFileTypes={{
                      'image/*': ['.jpg', '.jpeg', '.png'],
                    }}
                    onAdd={handleOnImageAdd}
                    onRemove={handleOnImageRemove}
                    imagePreviewRatio={1 / 3}
                  />
                )}

                {imageShouldBeSaved && (
                  <Box display="flex" flexDirection="column" gap="8px">
                    <ImageCropperContainer
                      image={uploadedImage}
                      onComplete={handleImageCropChange}
                      aspectRatioWidth={3}
                      aspectRatioHeight={1}
                      onRemove={handleOnImageRemove}
                    />
                  </Box>
                )}
              </SectionField>
              {uploadedImage && (
                <SectionField>
                  <Label>
                    <FormattedMessage {...messages.eventImageAltTextTitle} />
                    <IconTooltip
                      content={
                        <FormattedMessage
                          {...projectMessages.projectImageAltTextTooltip}
                        />
                      }
                    />
                  </Label>
                  <InputMultilocWithLocaleSwitcher
                    type="text"
                    valueMultiloc={eventImageAltText}
                    label={<FormattedMessage {...projectMessages.altText} />}
                    onChange={handleEventImageAltTextChange}
                  />
                </SectionField>
              )}

              <Title variant="h4" color="primary" fontWeight="semi-bold">
                {formatMessage(messages.eventDates)}
              </Title>
              {eventAttrs.start_at && eventAttrs.end_at && (
                <DateTimeSelection
                  startAt={eventAttrs.start_at}
                  endAt={eventAttrs.end_at}
                  errors={errors}
                  setAttributeDiff={handleDateTimePickerOnChange}
                />
              )}

              <Title variant="h4" color="primary" fontWeight="semi-bold">
                {formatMessage(messages.eventLocation)}
              </Title>
              <SectionField>
                <Box mt="16px" maxWidth="400px">
                  <Input
                    id="event-location"
                    label={formatMessage(messages.onlineEventLinkLabel)}
                    type="text"
                    value={eventAttrs.online_link}
                    onChange={handleOnlineLinkOnChange}
                    labelTooltipText={formatMessage(
                      messages.onlineEventLinkTooltip
                    )}
                    placeholder={'https://...'}
                  />
                </Box>
                <ErrorComponent apiErrors={get(errors, 'online_link')} />
              </SectionField>

              <SectionField>
                <Box maxWidth="400px">
                  <Box mb="8px">
                    <Label>
                      {formatMessage(messages.addressOneLabel)}
                      <IconTooltip
                        content={formatMessage(messages.addressOneTooltip)}
                      />
                    </Label>
                  </Box>

                  <LocationInput
                    id="event-location-picker"
                    className="e2e-event-location-input"
                    value={
                      eventAttrs.address_1
                        ? {
                            value: eventAttrs.address_1,
                            label: eventAttrs.address_1,
                          }
                        : null
                    }
                    onChange={(option: Option | null) => {
                      handleAddress1OnChange(option?.value ? option.value : '');
                    }}
                    placeholder={formatMessage(messages.searchForLocation)}
                  />

                  <ErrorComponent apiErrors={get(errors, 'address_1')} />
                  <Box mt="20px" mb="8px">
                    <InputMultilocWithLocaleSwitcher
                      id="event-address-2"
                      label={formatMessage(messages.addressTwoLabel)}
                      type="text"
                      valueMultiloc={eventAttrs.address_2_multiloc}
                      onChange={handleAddress2OnChange}
                      labelTooltipText={formatMessage(
                        messages.addressTwoTooltip
                      )}
                      placeholder={formatMessage(
                        messages.addressTwoPlaceholder
                      )}
                    />
                  </Box>
                  {locationPoint && (
                    <Box maxWidth="400px" zIndex="0">
                      <Box display="flex">
                        <Text color="coolGrey600" my="4px" mr="4px">
                          {formatMessage(messages.refineOnMap)}
                        </Text>
                        <IconTooltip
                          content={formatMessage(
                            messages.refineOnMapInstructions
                          )}
                        />
                      </Box>

                      <Box>
                        <EventMap
                          mapHeight="230px"
                          setSubmitState={setSubmitState}
                          setLocationPoint={setLocationPoint}
                          position={
                            geocodedPoint || // Present when an address is geocoded but hasn't been saved yet
                            // TODO: Fix this the next time the file is edited.
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            event?.data?.attributes?.location_point_geojson
                          }
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              </SectionField>

              <Title
                variant="h4"
                color="primary"
                fontWeight="semi-bold"
                mt="48px"
              >
                {formatMessage(messages.registrationLimit)}
              </Title>
              <SectionField>
                <Toggle
                  label={
                    <Box display="flex">
                      {formatMessage(messages.toggleRegistrationLimitLabel)}
                      <Box ml="4px">
                        <IconTooltip
                          content={formatMessage(
                            messages.toggleRegistrationLimitTooltip
                          )}
                        />
                      </Box>
                    </Box>
                  }
                  checked={registrationLimitVisible}
                  onChange={() => {
                    handleLimitToggleOnChange(!registrationLimitVisible);
                  }}
                />
              </SectionField>
              {registrationLimitVisible && (
                <SectionField>
                  <Input
                    id="maximum_attendees"
                    label={formatMessage(messages.maximumRegistrants)}
                    type="number"
                    value={eventAttrs.maximum_attendees?.toString()}
                    onChange={handleMaximumRegistrantsChange}
                  />
                  <ErrorComponent
                    fieldName="maximum_attendees"
                    apiErrors={get(errors, 'maximum_attendees')}
                  />
                </SectionField>
              )}

              <Title
                variant="h4"
                color="primary"
                fontWeight="semi-bold"
                mt="48px"
              >
                {formatMessage(messages.registerButton)}
              </Title>
              <SectionField>
                <Toggle
                  label={
                    <Box display="flex">
                      {formatMessage(messages.toggleCustomRegisterButtonLabel)}
                      <Box ml="4px">
                        <IconTooltip
                          content={formatMessage(
                            messages.toggleCustomRegisterButtonTooltip2
                          )}
                        />
                      </Box>
                    </Box>
                  }
                  checked={registerButtonOptionsVisible}
                  onChange={() => {
                    handleCustomButtonToggleOnChange(
                      !registerButtonOptionsVisible
                    );
                  }}
                />
              </SectionField>
              {registerButtonOptionsVisible && (
                <>
                  <SectionField>
                    <Box maxWidth="400px">
                      <InputMultilocWithLocaleSwitcher
                        id="custom-button-text"
                        label={formatMessage(messages.customButtonText)}
                        type="text"
                        valueMultiloc={eventAttrs.attend_button_multiloc}
                        onChange={handleCustomButtonMultilocOnChange}
                        labelTooltipText={formatMessage(
                          messages.customButtonTextTooltip3
                        )}
                        maxCharCount={28}
                      />
                    </Box>
                  </SectionField>
                  <SectionField>
                    <Box maxWidth="400px">
                      <Input
                        label={formatMessage(messages.customButtonLink)}
                        type="text"
                        value={eventAttrs.using_url}
                        onChange={handleCustomButtonLinkOnChange}
                        labelTooltipText={formatMessage(
                          messages.customButtonLinkTooltip
                        )}
                        placeholder={'https://...'}
                      />
                    </Box>
                    <ErrorComponent apiErrors={get(errors, 'using_url')} />
                  </SectionField>
                  {!isNilOrError(locale) && (
                    <Box display="flex" flexWrap="wrap">
                      <Box width="100%">
                        <Label>{formatMessage(messages.preview)}</Label>
                      </Box>
                      <ButtonWithLink
                        minWidth="160px"
                        iconPos={'right'}
                        icon={
                          // TODO: Fix this the next time the file is edited.
                          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                          registerButtonOptionsVisible
                            ? undefined
                            : 'plus-circle'
                        }
                        iconSize="20px"
                        bgColor={theme.colors.tenantPrimary}
                        linkTo={eventAttrs.using_url}
                        openLinkInNewTab={true}
                      >
                        {/* TODO: Fix this the next time the file is edited. */}
                        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
                        {eventAttrs?.attend_button_multiloc?.[locale]
                          ? // TODO: Fix this the next time the file is edited.
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            eventAttrs?.attend_button_multiloc[locale]
                          : formatMessage(messages.register)}
                      </ButtonWithLink>
                    </Box>
                  )}
                </>
              )}

              <Title
                variant="h4"
                color="primary"
                fontWeight="semi-bold"
                mt="48px"
              >
                {formatMessage(messages.additionalInformation)}
              </Title>
              <SectionField>
                <Label>
                  <FormattedMessage {...messages.fileUploadLabel} />
                  <IconTooltip
                    content={
                      <FormattedMessage {...messages.fileUploadLabelTooltip} />
                    }
                  />
                </Label>
                <FileRepositorySelectAndUpload
                  id="project-events-edit-form-file-uploader"
                  onFileAdd={handleEventFileOnAdd}
                  onFileRemove={handleEventFileOnRemove}
                  onFileReorder={handleFilesReorder}
                  onFileAttach={handleEventFileOnAttach}
                  fileAttachments={eventFileAttachments}
                  enableDragAndDrop
                  apiErrors={isError(apiErrors) ? undefined : apiErrors}
                  maxSizeMb={10}
                />
              </SectionField>
            </Section>

            <Box
              position="fixed"
              borderTop={`1px solid ${colors.divider}`}
              bottom="0"
              w={`calc(${width}px + ${defaultAdminCardPadding * 2}px)`}
              ml={`-${defaultAdminCardPadding}px`}
              background={colors.white}
              display="flex"
              justifyContent="flex-start"
            >
              <Box py="8px" px={`${defaultAdminCardPadding}px`}>
                <SubmitWrapper
                  loading={saving}
                  status={submitState}
                  messages={{
                    buttonSave: messages.saveButtonLabel,
                    buttonSuccess: messages.saveSuccessLabel,
                    messageError: messages.saveErrorMessage,
                    messageSuccess: messages.saveSuccessMessage,
                  }}
                />
              </Box>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminProjectEventEdit;
