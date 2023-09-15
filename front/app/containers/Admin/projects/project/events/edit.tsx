import React, { useState, useEffect, FormEvent } from 'react';
import moment from 'moment';
import { isEmpty, get, isError } from 'lodash-es';

// components
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import ErrorComponent from 'components/UI/Error';
import DateTimePicker from 'components/admin/DateTimePicker';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import FileUploader from 'components/UI/FileUploader';
import {
  Box,
  Button,
  IconTooltip,
  Input,
  Label,
  LocationInput,
  Spinner,
  Title,
} from '@citizenlab/cl2-component-library';
import Map from './components/map';
import { leafletMapClicked$ } from 'components/UI/LeafletMap/events';
import Modal from 'components/UI/Modal';
import ImagesDropzone from 'components/UI/ImagesDropzone';

// router
import clHistory from 'utils/cl-router/history';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// react query
import { IEvent, IEventProperties } from 'api/events/types';
import useAddEvent from 'api/events/useAddEvent';
import useUpdateEvent from 'api/events/useUpdateEvent';
import useEvent from 'api/events/useEvent';
import useEventFiles from 'api/event_files/useEventFiles';
import useAddEventFile from 'api/event_files/useAddEventFile';
import useDeleteEventFile from 'api/event_files/useDeleteEventFile';
import useEventImage from 'api/event_images/useEventImage';
import useAddEventImage from 'api/event_images/useAddEventImage';

// typings
import { Multiloc, CLError, UploadFile } from 'typings';

// utils
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'react-router-dom';
import { geocode } from 'utils/locationTools';
import useDeleteEventImage from 'api/event_images/useDeleteEventImage';

type SubmitState = 'disabled' | 'enabled' | 'error' | 'success';
type ErrorType =
  | Error
  | CLError[]
  | {
      [fieldName: string]: CLError[];
    };

type ApiErrorType =
  | Error
  | {
      [fieldName: string]: CLError[];
    };

const AdminProjectEventEdit = () => {
  const { id, projectId } = useParams() as {
    id: string;
    projectId: string;
  };
  const { formatMessage } = useIntl();
  const { mutate: addEvent } = useAddEvent();
  const { data: event, isInitialLoading } = useEvent(id);
  const { mutate: updateEvent } = useUpdateEvent();
  const { mutate: addEventFile } = useAddEventFile();
  const { mutate: deleteEventFile } = useDeleteEventFile();
  const { mutate: addEventImage } = useAddEventImage();
  const { mutate: deleteEventImage } = useDeleteEventImage();
  const remoteEventImageId =
    event?.data.relationships?.['event_images']?.data?.[0]?.id;
  const { data: remoteEventImage } = useEventImage(
    id,
    remoteEventImageId || undefined
  );
  const { data: remoteEventFiles } = useEventFiles(id);
  const [errors, setErrors] = useState<ErrorType>({});
  const [apiErrors, setApiErrors] = useState<ApiErrorType>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [submitState, setSubmitState] = useState<SubmitState>('disabled');
  const [eventFiles, setEventFiles] = useState<UploadFile[]>([]);
  const [attributeDiff, setAttributeDiff] = useState<IEventProperties>({});
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadFile | null>(null);
  const [locationPoint, setLocationPoint] = useState<GeoJSON.Point | null>(
    event?.data?.attributes?.location_point_geojson || null
  );
  const [eventFilesToRemove, setEventFilesToRemove] = useState<UploadFile[]>(
    []
  );
  const [successfulGeocode, setSuccessfulGeocode] = useState(false);

  // Remote values
  const remotePoint = event?.data?.attributes?.location_point_geojson;

  const eventAttrs = event
    ? { ...event?.data.attributes, ...attributeDiff }
    : { ...attributeDiff };

  // Set image value to remote image if present
  useEffect(() => {
    async function convertRemoteImage() {
      if (remoteEventImage) {
        const imageUrl = remoteEventImage.data.attributes.versions.medium;
        if (imageUrl) {
          const imageFile = await convertUrlToUploadFile(imageUrl);
          setUploadedImage(imageFile);
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

  // Listen for map clicks to update the location point
  useEffect(() => {
    const subscriptions = [
      leafletMapClicked$.subscribe(async (latLng) => {
        const selectedPoint = {
          type: 'Point',
          coordinates: [latLng.lng, latLng.lat],
        } as GeoJSON.Point;
        setSubmitState('enabled');
        setLocationPoint(selectedPoint);
      }),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, []);

  // When address 1 is updated, geocode the location point to match
  useEffect(() => {
    if (eventAttrs.address_1 !== event?.data.attributes.address_1) {
      const delayDebounceFn = setTimeout(async () => {
        const point = await geocode(eventAttrs.address_1);
        setLocationPoint(point);
        setSuccessfulGeocode(!!point);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
    setSuccessfulGeocode(false);
    return;
  }, [eventAttrs.address_1, event]);

  // Set event files to remote event files
  useEffect(() => {
    if (!isNilOrError(remoteEventFiles)) {
      (async () => {
        const files = await Promise.all(
          remoteEventFiles.data.map(
            async (file) =>
              await convertUrlToUploadFile(file.attributes.file.url, file.id)
          )
        );
        setEventFiles(files as UploadFile[]);
      })();
    }
  }, [remoteEventFiles]);

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

  const handleDateTimePickerOnChange =
    (name: 'start_at' | 'end_at') => (moment: moment.Moment) => {
      if (!isInitialLoading) {
        setSubmitState('enabled');
        setAttributeDiff((previousState) => {
          return {
            ...previousState,
            [name]: moment.toISOString(),
          };
        });
        setErrors({});
      }
    };

  const handleOnImageAdd = (imageFiles: UploadFile[]) => {
    setSubmitState('enabled');
    setUploadedImage(imageFiles[0]);
  };

  const handleOnImageRemove = () => {
    setSubmitState('enabled');
    setUploadedImage(null);
  };

  const handleEventFileOnAdd = (newFile: UploadFile) => {
    setSubmitState('enabled');
    setEventFiles([...eventFiles, newFile]);
  };

  const handleEventFileOnRemove = (eventFileToRemove: UploadFile) => {
    setSubmitState('enabled');
    setEventFilesToRemove([...eventFilesToRemove, eventFileToRemove]);
    setEventFiles(
      eventFiles.filter(
        (eventFile) => eventFile.base64 !== eventFileToRemove.base64
      )
    );
  };

  const handleEventImage = async (data: IEvent) => {
    const hasRemoteImage = !isNilOrError(remoteEventImage);

    if ((uploadedImage === null || !uploadedImage.remote) && hasRemoteImage) {
      deleteEventImage({
        eventId: id,
        imageId: event?.data.relationships['event_images'].data[0].id,
      });
    }
    if (uploadedImage && !uploadedImage.remote) {
      addEventImage({
        eventId: data.data.id,
        image: {
          image: uploadedImage.base64,
        },
      });
    }
  };

  const handleEventFiles = async (data: IEvent) => {
    setSubmitState('success');

    if (data) {
      const { id: eventId } = data.data;
      eventFiles
        .filter((file) => !file.remote)
        .map((file) =>
          addEventFile(
            {
              eventId,
              file: file.base64,
              name: file.name,
              ordering: null,
            },
            {
              onSuccess: () => {
                setSubmitState('success');
              },
              onError: () => {
                setSubmitState('error');
              },
            }
          )
        );
      eventFilesToRemove
        .filter((file) => !!file.remote)
        .map((file) => {
          if (file.id) {
            deleteEventFile(
              { eventId, fileId: file.id },
              {
                onSuccess: () => {
                  setEventFilesToRemove(
                    eventFilesToRemove.filter((fileToRemove) => {
                      fileToRemove.id !== file.id;
                    })
                  );
                  setSubmitState('success');
                },
                onError: () => {
                  setSubmitState('error');
                },
              }
            );
          }
        });
    }
  };

  const handleOnSubmit = async (e: FormEvent) => {
    const locationPointChanged =
      locationPoint !== event?.data.attributes.location_point_geojson;

    const locationPointUpdated =
      eventAttrs.address_1 || successfulGeocode ? locationPoint : null;

    e.preventDefault();
    try {
      setSaving(true);

      // If only files have changed
      if (isEmpty(attributeDiff) && eventFilesToRemove) {
        if (event) {
          handleEventFiles(event);
        }
      }

      // non-file input fields have changed
      if (!isEmpty(attributeDiff) || locationPointChanged) {
        // event already exists (in the state)
        if (event) {
          updateEvent(
            {
              eventId: event?.data.id,
              event: {
                ...attributeDiff,
                location_point_geojson: locationPointChanged
                  ? locationPointUpdated
                  : event?.data.attributes.location_point_geojson,
              },
            },
            {
              onSuccess: async (data) => {
                setSubmitState('success');
                handleEventFiles(data);
                handleEventImage(data);
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
                handleEventFiles(data);
                clHistory.push(`/admin/projects/${projectId}/events`);
              },
              onError: async (errors) => {
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

  const descriptionLabel = <FormattedMessage {...messages.descriptionLabel} />;

  if (event !== undefined && isInitialLoading) {
    return <Spinner />;
  }

  return (
    <>
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
                label={descriptionLabel}
                valueMultiloc={eventAttrs.description_multiloc}
                onChange={handleDescriptionMultilocOnChange}
                withCTAButton
              />
            </Box>
            <ErrorComponent apiErrors={get(errors, 'description_multiloc')} />
          </SectionField>
          <SectionField>
            <Label>{formatMessage(messages.eventImage)}</Label>
            <ImagesDropzone
              images={uploadedImage ? [uploadedImage] : []}
              maxImagePreviewWidth="360px"
              objectFit="contain"
              acceptedFileTypes={{
                'image/*': ['.jpg', '.jpeg', '.png'],
              }}
              onAdd={handleOnImageAdd}
              onRemove={handleOnImageRemove}
              imagePreviewRatio={1 / 2}
            />
          </SectionField>
          <Title
            variant="h4"
            fontWeight="bold"
            color="primary"
            style={{ fontWeight: '600' }}
          >
            {formatMessage(messages.eventDates)}
          </Title>
          <Box display="flex" gap="32px">
            <SectionField style={{ width: 'auto' }}>
              <Label>
                <FormattedMessage {...messages.dateStartLabel} />
              </Label>
              <DateTimePicker
                value={eventAttrs.start_at}
                onChange={handleDateTimePickerOnChange('start_at')}
              />
              <ErrorComponent apiErrors={get(errors, 'start_at')} />
            </SectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.datesEndLabel} />
              </Label>
              <DateTimePicker
                value={eventAttrs.end_at}
                onChange={handleDateTimePickerOnChange('end_at')}
              />
              <ErrorComponent apiErrors={get(errors, 'end_at')} />
            </SectionField>
          </Box>

          <Title
            variant="h4"
            fontWeight="bold"
            color="primary"
            style={{ fontWeight: '600' }}
          >
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
                value={eventAttrs.address_1 || ''}
                onChange={(value) => {
                  handleAddress1OnChange(value);
                }}
                placeholder={formatMessage(messages.searchForLocation)}
              />

              <ErrorComponent apiErrors={get(errors, 'address_1')} />
              <Box my="20px">
                <InputMultilocWithLocaleSwitcher
                  id="event-address-2"
                  label={formatMessage(messages.addressTwoLabel)}
                  type="text"
                  valueMultiloc={eventAttrs.address_2_multiloc}
                  onChange={handleAddress2OnChange}
                  labelTooltipText={formatMessage(messages.addressTwoTooltip)}
                  placeholder={formatMessage(messages.addressTwoPlaceholder)}
                />
              </Box>
              {locationPoint && (
                <Box maxWidth="400px" zIndex="0">
                  <Box>
                    <Map
                      position={locationPoint}
                      projectId={projectId}
                      mapHeight="160px"
                      hideLegend={true}
                      singleClickEnabled={false}
                    />
                  </Box>
                  <Button
                    mt="8px"
                    icon="position"
                    buttonStyle="secondary"
                    onClick={() => {
                      setMapModalVisible(true);
                    }}
                  >
                    {formatMessage(messages.refineOnMap)}
                  </Button>
                </Box>
              )}
            </Box>
          </SectionField>
          <Title
            variant="h4"
            fontWeight="bold"
            color="primary"
            style={{ fontWeight: '600' }}
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
            <FileUploader
              id="project-events-edit-form-file-uploader"
              onFileAdd={handleEventFileOnAdd}
              onFileRemove={handleEventFileOnRemove}
              files={eventFiles}
              apiErrors={isError(apiErrors) ? undefined : apiErrors}
            />
          </SectionField>
        </Section>

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
      </form>
      <Modal
        opened={mapModalVisible}
        close={() => {
          setMapModalVisible(false);
        }}
        header={formatMessage(messages.refineLocationCoordinates)}
        width={'800px'}
      >
        <Box p="16px">
          {locationPoint && (
            <Box>
              <Label>
                <FormattedMessage {...messages.mapSelectionLabel} />
              </Label>
              <Map
                position={locationPoint}
                projectId={projectId}
                mapHeight="400px"
              />
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default AdminProjectEventEdit;
