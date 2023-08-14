import React, { useState, useEffect } from 'react';
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
  Label,
  LocationInput,
  Spinner,
  Title,
} from '@citizenlab/cl2-component-library';
import Map from './components/map';
import { leafletMapClicked$ } from 'components/UI/LeafletMap/events';

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
import useLocale from 'hooks/useLocale';
import useEventFiles from 'api/event_files/useEventFiles';
import useAddEventFile from 'api/event_files/useAddEventFile';
import useDeleteEventFile from 'api/event_files/useDeleteEventFile';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// typings
import { Multiloc, CLError, UploadFile } from 'typings';

// utils
import { withRouter } from 'utils/cl-router/withRouter';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import { geocode } from 'utils/locationTools';
import Modal from 'components/UI/Modal';

interface Props {
  params: Record<string, string>;
}

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

const AdminProjectEventEdit = ({ params }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: addEvent } = useAddEvent();
  const { data: event, isInitialLoading } = useEvent(params.id);
  const { mutate: updateEvent } = useUpdateEvent();
  const { mutate: addEventFile } = useAddEventFile();
  const { mutate: deleteEventFile } = useDeleteEventFile();
  const { data: remoteEventFiles } = useEventFiles(params.id);
  const locale = useLocale();
  const appConfiguration = useAppConfiguration();
  const [errors, setErrors] = useState<ErrorType>({});
  const [apiErrors, setApiErrors] = useState<ApiErrorType>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [submitState, setSubmitState] = useState<SubmitState>('disabled');
  const [eventFiles, setEventFiles] = useState<UploadFile[]>([]);
  const [attributeDiff, setAttributeDiff] = useState<IEventProperties>({});
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [locationPoint, setLocationPoint] = useState<GeoJSON.Point | null>(
    null
  );
  const [locationDescription, setLocationDescription] = useState('');
  const [eventFilesToRemove, setEventFilesToRemove] = useState<UploadFile[]>(
    []
  );
  const [successfulGeocode, setSuccessfulGeocode] = useState(false);

  const remotePoint = event?.data?.attributes?.location_point_geojson;
  const remoteLocationDescription =
    event?.data?.attributes?.location_description;

  useEffect(() => {
    if (!isNilOrError(remoteLocationDescription)) {
      setLocationDescription(() => remoteLocationDescription);
    }
  }, [remoteLocationDescription]);

  useEffect(() => {
    if (!isNilOrError(remotePoint)) {
      setLocationPoint(() => remotePoint);
      setSuccessfulGeocode(true);
    }
  }, [remotePoint]);

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

  useEffect(() => {
    if (locationDescription !== event?.data.attributes.location_description) {
      const delayDebounceFn = setTimeout(async () => {
        const point = await geocode(locationDescription);
        setLocationPoint(point);
        point ? setSuccessfulGeocode(true) : setSuccessfulGeocode(false);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
    setSuccessfulGeocode(false);
    return;
  }, [locationDescription, event, attributeDiff]);

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

  const handleLocationMultilocOnChange = (locationMultiloc: Multiloc) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      location_multiloc: locationMultiloc,
    });
  };

  const handleLocationDescriptionOnChange = async (location: string) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      location_description: location,
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

  const handleOnSubmit = async (e) => {
    const locationPointChanged =
      locationPoint !== event?.data.attributes.location_point_geojson;

    const locationPointUpdated =
      locationDescription || successfulGeocode ? locationPoint : null;

    e.preventDefault();
    if (!isNilOrError(params.projectId)) {
      const { projectId } = params;
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
                event: attributeDiff,
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
    }
  };

  const descriptionLabel = <FormattedMessage {...messages.descriptionLabel} />;

  if (locale && appConfiguration) {
    const eventAttrs = event
      ? { ...event?.data.attributes, ...attributeDiff }
      : { ...attributeDiff };

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
                  value={eventAttrs.location_description || ''}
                  onChange={(value) => {
                    handleLocationDescriptionOnChange(value);
                    setLocationDescription(value);
                  }}
                  placeholder={formatMessage(messages.searchForLocation)}
                />

                <ErrorComponent
                  apiErrors={get(errors, 'location_description')}
                />
                <Box my="20px">
                  <InputMultilocWithLocaleSwitcher
                    id="event-location"
                    label={formatMessage(messages.addressTwoLabel)}
                    type="text"
                    valueMultiloc={eventAttrs.location_multiloc}
                    onChange={handleLocationMultilocOnChange}
                    labelTooltipText={formatMessage(messages.addressTwoTooltip)}
                    placeholder={formatMessage(messages.addressTwoPlaceholder)}
                  />
                </Box>
                {locationPoint && (
                  <Box maxWidth="400px" zIndex="0">
                    <Box>
                      <Map
                        position={locationPoint}
                        projectId={params.projectId}
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
          className="e2e-comment-deletion-modal"
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
                  projectId={params.projectId}
                  mapHeight="400px"
                />
              </Box>
            )}
          </Box>
        </Modal>
      </>
    );
  }

  return null;
};

export default withRouter((props) => <AdminProjectEventEdit {...props} />);
