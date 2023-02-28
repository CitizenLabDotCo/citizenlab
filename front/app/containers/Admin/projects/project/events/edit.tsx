import React, { useState, useEffect } from 'react';
import { Subscription, combineLatest, of } from 'rxjs';
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
import { IconTooltip, Label } from '@citizenlab/cl2-component-library';

// utils
import unsubscribe from 'utils/unsubscribe';
import { withRouter } from 'utils/cl-router/withRouter';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// services
import { localeStream } from 'services/locale';
import {
  currentAppConfigurationStream,
  IAppConfiguration,
} from 'services/appConfiguration';
import {
  eventStream,
  updateEvent,
  IEvent,
  IUpdatedEventProperties,
} from 'services/events';
import { addEventFile, deleteEventFile } from 'services/eventFiles';

// resources
import GetRemoteFiles, {
  GetRemoteFilesChildProps,
} from 'resources/GetRemoteFiles';

// typings
import { Multiloc, CLError, Locale, UploadFile } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';
import useAddEvent from 'api/events/useAddEvent';
import { IAddEventProperties } from 'api/events/types';

interface DataProps {
  remoteEventFiles: GetRemoteFilesChildProps;
}
interface Props extends DataProps {
  params: Record<string, string>;
}

type SubmitState = 'disabled' | 'enabled' | 'error' | 'success';
type ErrorType =
  | {
      [fieldName: string]: CLError[];
    }
  | Error;

const AdminProjectEventEdit = ({
  params,
  remoteEventFiles,
}: Props & DataProps) => {
  const { mutate: addEvent, isSuccess, data } = useAddEvent();

  const [locale, setLocale] = useState<Locale | null>(null);
  const [currentTenant, setCurrentTenant] = useState<IAppConfiguration | null>(
    null
  );
  const [event, setEvent] = useState<IEvent | null>(null);
  const [attributeDiff, setAttributeDiff] = useState<IUpdatedEventProperties>(
    {}
  );
  const [errors, setErrors] = useState<ErrorType>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [eventFiles, setEventFiles] = useState<UploadFile[]>([]);
  const [eventFilesToRemove, setEventFilesToRemove] = useState<UploadFile[]>(
    []
  );
  const [submitState, setSubmitState] = useState<SubmitState>('disabled');

  // Moved subscriptions away from here - might need to move it back + use useRef ???

  useEffect(() => {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentAppConfigurationStream().observable;
    const event$ = params.id ? eventStream(params.id).observable : of(null);

    let subscriptions: Subscription[] = [];
    subscriptions = [
      combineLatest([locale$, currentTenant$, event$]).subscribe(
        ([locale, currentTenant, event]) => {
          setLocale(locale);
          setCurrentTenant(currentTenant);
          setEvent(event);
          setLoaded(true);
        }
      ),
    ];
    setEventFiles(!isNilOrError(remoteEventFiles) ? remoteEventFiles : []);
    return () => {
      unsubscribe(subscriptions);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   // Set the event files once remote files are loaded
  //   if (
  //     remoteEventFiles !== eventFiles &&
  //     eventFiles.length === 0 &&
  //     eventFilesToRemove.length === 0
  //   ) {
  //     setEventFiles(!isNilOrError(remoteEventFiles) ? remoteEventFiles : []);
  //   }
  // }, [eventFiles, eventFilesToRemove.length, remoteEventFiles]);

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
      setSubmitState('enabled');
      setAttributeDiff((previousState) => {
        return {
          ...previousState,
          [name]: moment.toISOString(),
        };
      });
      setErrors({});
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

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    if (!isNilOrError(params.projectId)) {
      const { projectId } = params;
      let eventResponse = event;
      let redirect = false;
      try {
        setSaving(true);
        // non-file input fields have changed
        if (!isEmpty(attributeDiff)) {
          // event already exists (in the state)
          if (event) {
            eventResponse = await updateEvent(event.data.id, attributeDiff);
            setEvent(eventResponse);
            setAttributeDiff({});
          } else if (projectId) {
            // event doesn't exist, create with project id
            const payload: IAddEventProperties = {
              projectId,
              event: attributeDiff,
            };
            addEvent(payload);
            setEvent(eventResponse);
            setAttributeDiff({});
            redirect = true;
          }
        }

        if (isSuccess && data) {
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

        setSaving(false);
        setErrors({});
        setSubmitState('success');
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

  if (locale && currentTenant && loaded) {
    const eventAttrs = event
      ? { ...event.data.attributes, ...attributeDiff }
      : { ...attributeDiff };

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

export default withRouter((props) => (
  <GetRemoteFiles resourceId={props.params.id} resourceType="event">
    {(remoteEventFiles) => (
      <AdminProjectEventEdit remoteEventFiles={remoteEventFiles} {...props} />
    )}
  </GetRemoteFiles>
));
