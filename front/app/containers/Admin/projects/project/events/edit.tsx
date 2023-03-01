import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { isEmpty, get, isError } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// libraries
import clHistory from 'utils/cl-router/history';

// components
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import ErrorComponent from 'components/UI/Error';
import DateTimePicker from 'components/admin/DateTimePicker';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import FileUploader from 'components/UI/FileUploader';
import { IconTooltip, Label, Spinner } from '@citizenlab/cl2-component-library';

// utils
import { withRouter } from 'utils/cl-router/withRouter';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// react query
import { IEvent, IEventProperties } from 'api/events/types';
import useAddEvent from 'api/events/useAddEvent';
import useUpdateEvent from 'api/events/useUpdateEvent';
import useEvent from 'api/events/useEvent';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocale from 'hooks/useLocale';
import useEventFiles from 'api/event_files/useEventFiles';

// services
import { addEventFile, deleteEventFile } from 'services/eventFiles';

// typings
import { Multiloc, CLError, UploadFile } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';

// utils
import { convertUrlToUploadFile } from 'utils/fileUtils';

interface Props {
  params: Record<string, string>;
}

type SubmitState = 'disabled' | 'enabled' | 'error' | 'success';
type ErrorType =
  | Error
  | {
      [fieldName: string]: CLError[];
    };

const AdminProjectEventEdit = ({ params }: Props) => {
  const { mutate: addEvent } = useAddEvent();
  const { data: event, isInitialLoading } = useEvent(params.id);
  const { mutate: updateEvent } = useUpdateEvent();
  const locale = useLocale();
  const appConfiguration = useAppConfiguration();
  const { data: remoteEventFiles } = useEventFiles(params.id);
  const [errors, setErrors] = useState<ErrorType>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [submitState, setSubmitState] = useState<SubmitState>('disabled');
  const [eventFiles, setEventFiles] = useState<UploadFile[]>([]);
  const [attributeDiff, setAttributeDiff] = useState<IEventProperties>({});
  const [eventFilesToRemove, setEventFilesToRemove] = useState<UploadFile[]>(
    []
  );

  useEffect(() => {
    // Set the event files once remote files are loaded
    if (!isNilOrError(remoteEventFiles)) {
      (async () => {
        const file = await convertUrlToUploadFile(
          remoteEventFiles.data[0].attributes.file.url
        );
        setEventFiles(
          (previousEventFiles) =>
            previousEventFiles.length === 0 && file ? [file] : [] // TODO Fix this logic
        );
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
    if (data) {
      const { id: eventId } = data.data;
      const filesToAddPromises = eventFiles
        .filter((file) => !file.remote)
        .map((file) => addEventFile(eventId, file.base64, file.name));
      const filesToRemovePromises = eventFilesToRemove
        .filter((file) => !!(file.remote && file.id))
        .map((file) => deleteEventFile(eventId, file.id as string));

      await Promise.all([
        ...filesToAddPromises,
        ...filesToRemovePromises,
      ] as Promise<any>[]);
    }
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    if (!isNilOrError(params.projectId)) {
      const { projectId } = params;
      let redirect = false;
      try {
        setSaving(true);
        // non-file input fields have changed
        if (!isEmpty(attributeDiff)) {
          // event already exists (in the state)
          if (event) {
            updateEvent(
              {
                eventId: event.data.id,
                event: attributeDiff,
              },
              {
                onSuccess: async (data) => {
                  setSubmitState('success');
                  handleEventFiles(data);
                },
                onError: async (errors) => {
                  setErrors(errors);
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
                },
                onError: async (errors) => {
                  setErrors(errors);
                  setSubmitState('error');
                },
              }
            );
            redirect = true;
          }
        }

        setSaving(false);
        setEventFilesToRemove([]);

        if (redirect && projectId) {
          clHistory.push(`/admin/projects/${projectId}/events/`);
        }
      } catch (errors) {
        if (isCLErrorJSON(errors)) {
          setSaving(false);
          setErrors(errors.json.errors);
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
      ? { ...event.data.attributes, ...attributeDiff }
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
                apiErrors={isError(errors) ? undefined : errors}
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
