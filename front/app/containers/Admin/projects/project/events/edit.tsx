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
import { IconTooltip, Label, Spinner } from '@citizenlab/cl2-component-library';

// router
import clHistory from 'utils/cl-router/history';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
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
import { isCLErrorJSON } from 'utils/errorUtils';

// utils
import { withRouter } from 'utils/cl-router/withRouter';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';

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
  const [eventFilesToRemove, setEventFilesToRemove] = useState<UploadFile[]>(
    []
  );

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
        if (!isEmpty(attributeDiff)) {
          // event already exists (in the state)
          if (event) {
            updateEvent(
              {
                eventId: event?.data.id,
                event: attributeDiff,
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
        if (isCLErrorJSON(errors)) {
          setSaving(false);
          setApiErrors(errors.json.errors);
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

            <SectionField>
              <InputMultilocWithLocaleSwitcher
                id="location"
                label={<FormattedMessage {...messages.locationLabel} />}
                type="text"
                valueMultiloc={eventAttrs.location_multiloc}
                onChange={handleLocationMultilocOnChange}
              />
              <ErrorComponent apiErrors={get(errors, 'location_multiloc')} />
            </SectionField>

            <SectionField>
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

            <SectionField className="fullWidth">
              <QuillMultilocWithLocaleSwitcher
                id="description"
                label={descriptionLabel}
                valueMultiloc={eventAttrs.description_multiloc}
                onChange={handleDescriptionMultilocOnChange}
                withCTAButton
              />
              <ErrorComponent apiErrors={get(errors, 'description_multiloc')} />
            </SectionField>

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
      </>
    );
  }

  return null;
};

export default withRouter((props) => <AdminProjectEventEdit {...props} />);
