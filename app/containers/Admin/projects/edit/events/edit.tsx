import React from 'react';
import { Subscription, combineLatest, of } from 'rxjs';
import moment from 'moment';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// libraries
import clHistory from 'utils/cl-router/history';

// components
import Label from 'components/UI/Label';
import InputMultiloc from 'components/UI/InputMultiloc';
import QuillMultiloc from 'components/UI/QuillEditor/QuillMultiloc';
import ErrorComponent from 'components/UI/Error';
import DateTimePicker from 'components/admin/DateTimePicker';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import FileUploader from 'components/UI/FileUploader';

// utils
import unsubscribe from 'utils/unsubscribe';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { IProjectData } from 'services/projects';
import { eventStream, updateEvent, addEvent, IEvent, IUpdatedEventProperties } from 'services/events';
import { addEventFile, deleteEventFile } from 'services/eventFiles';

// resources
import GetResourceFileObjects, { GetResourceFileObjectsChildProps } from 'resources/GetResourceFileObjects';

// typings
import { Multiloc, CLError, Locale, UploadFile } from 'typings';

interface DataProps {
  remoteEventFiles: GetResourceFileObjectsChildProps;
}

interface Props extends DataProps {
  params: {
    id: string | null,
    projectId: string | null,
  };
  project: IProjectData | null;
}

interface State {
  locale: Locale | null;
  currentTenant: ITenant | null;
  event: IEvent | null;
  attributeDiff: IUpdatedEventProperties;
  errors: {
    [fieldName: string]: CLError[]
  };
  saving: boolean;
  focusedInput: 'startDate' | 'endDate' | null;
  saved: boolean;
  loaded: boolean;
  localEventFiles: UploadFile[] | null;
  isNewEvent: boolean;
  submitState: 'disabled' | 'enabled' | 'error' | 'success';
}

class AdminProjectEventEdit extends React.PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null,
      event: null,
      attributeDiff: {},
      errors: {},
      saving: false,
      focusedInput: null,
      saved: false,
      loaded: false,
      localEventFiles: null,
      isNewEvent: true,
      submitState: 'disabled',
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const { remoteEventFiles } = this.props;
    const event$ = (this.props.params.id ? eventStream(this.props.params.id).observable : of(null));

    this.subscriptions = [
      combineLatest(
        locale$,
        currentTenant$,
        event$
      ).subscribe(([locale, currentTenant, event]) => {
        this.setState({ locale, currentTenant, event, loaded: true, isNewEvent: event === null });
      })
    ];

    this.setState({ localEventFiles: !isNilOrError(remoteEventFiles) ? remoteEventFiles : null });
  }

  componentDidUpdate(prevProps: Props) {
    const { remoteEventFiles } = this.props;

    if (prevProps.remoteEventFiles !== remoteEventFiles) {
      this.setState({ localEventFiles: !isNilOrError(remoteEventFiles) ? remoteEventFiles : null });
    }
  }

  componentWillUnmount() {
    unsubscribe(this.subscriptions);
  }

  handleTitleMultilocOnChange = (titleMultiloc: Multiloc) => {
    this.setState((state) => ({
      submitState: 'enabled',
      attributeDiff: {
        ...state.attributeDiff,
        title_multiloc: titleMultiloc
      }
    }));
  }

  handleLocationMultilocOnChange = (locationMultiloc: Multiloc) => {
    this.setState((state) => ({
      submitState: 'enabled',
      attributeDiff: {
        ...state.attributeDiff,
        location_multiloc: locationMultiloc
      }
    }));
  }

  handleDescriptionMultilocOnChange = (descriptionMultiloc: Multiloc) => {
    this.setState((state) => ({
      submitState: 'enabled',
      attributeDiff: {
        ...state.attributeDiff,
        description_multiloc: descriptionMultiloc
      }
    }));
  }

  handleDateTimePickerOnChange = (name: 'start_at' | 'end_at') => (moment: moment.Moment) => {
    this.setState((state) => ({
      submitState: 'enabled',
      attributeDiff: {
        ...state.attributeDiff,
        [name]: moment.toISOString()
      },
      errors: {}
    }));
  }

  handleEventFileOnAdd = (newFile: UploadFile) => {
    this.setState((prevState) => {
      // If we don't have localEventFiles, we assign an empty array
      // A spread operator works on an empty array, but not on null
      const oldlLocalEventFiles = !isNilOrError(prevState.localEventFiles) ? prevState.localEventFiles : [];

      return {
        submitState: 'enabled',
        localEventFiles: [
          ...oldlLocalEventFiles,
          newFile
        ]
      };
    });
  }

  handleEventFileOnRemove = (removedFile: UploadFile) => () => {
    this.setState((prevState) => {
      let localEventFiles: UploadFile[] | null = null;

      if (Array.isArray(prevState.localEventFiles)) {
        localEventFiles = prevState.localEventFiles.filter(eventFile => eventFile.filename !== removedFile.filename);
      }

      return {
        localEventFiles,
        submitState: 'enabled'
      };
    });
  }

  getFilesToAddPromises = (eventId: string) => {
    const { localEventFiles } = this.state;
    const { remoteEventFiles } = this.props;
    let filesToAdd = localEventFiles;
    let filesToAddPromises: Promise<any>[] = [];

    if (!isNilOrError(localEventFiles) && Array.isArray(remoteEventFiles)) {
      // localEventFiles = local state of files
      // This means those previously uploaded + files that have been added/removed
      // remoteEventFiles = last saved state of files (remote)

      filesToAdd = localEventFiles.filter((localEventFile) => {
        return !remoteEventFiles.some(remoteEventFile => remoteEventFile.filename === localEventFile.filename);
      });
    }

    if (eventId && !isNilOrError(filesToAdd) && filesToAdd.length > 0) {
      filesToAddPromises = filesToAdd.map((fileToAdd: any) => addEventFile(eventId as string, fileToAdd.base64, fileToAdd.name));
    }

    return filesToAddPromises;
  }

  getFilesToRemovePromises = (eventId: string) => {
    const { localEventFiles } = this.state;
    const { remoteEventFiles } = this.props;
    let filesToRemove = remoteEventFiles;
    let filesToRemovePromises: Promise<any>[] = [];

    if (!isNilOrError(localEventFiles) && Array.isArray(remoteEventFiles)) {
      // localEventFiles = local state of files
      // This means those previously uploaded + files that have been added/removed
      // remoteEventFiles = last saved state of files (remote)

      filesToRemove = remoteEventFiles.filter((remoteEventFile) => {
        return !localEventFiles.some(localEventFile => localEventFile.filename === remoteEventFile.filename);
      });
    }

    if (eventId && !isNilOrError(filesToRemove) && filesToRemove.length > 0) {
      filesToRemovePromises = filesToRemove.map((fileToRemove: any) => deleteEventFile(eventId as string, fileToRemove.id));
    }

    return filesToRemovePromises;
  }

  handleOnSubmit = async (event) => {
    event.preventDefault();
    const projectId = !isNilOrError(this.props.project) ? this.props.project.id : null;
    const { event: projectEvent } = this.state;
    let eventResponse = projectEvent;
    let redirect = false;

    try {
      this.setState({ saving: true, saved: false });

      // non-file input fields have changed
      if (!isEmpty(this.state.attributeDiff)) {
        // event already exists (in the state)
        if (projectEvent) {
          eventResponse = await updateEvent(projectEvent.data.id, this.state.attributeDiff);
          this.setState({ event: eventResponse, attributeDiff: {} });
        } else if (projectId) {
          // event doesn't exist, create with project id
          eventResponse =  await addEvent(projectId, this.state.attributeDiff);
          this.setState({ event: eventResponse, attributeDiff: {} });
          redirect = true;
        }
      }

      if (eventResponse) {
        const { id: eventId } = eventResponse.data;
        const filesToAddPromises: Promise<any>[] = this.getFilesToAddPromises(eventId);
        const filesToRemovePromises: Promise<any>[] = this.getFilesToRemovePromises(eventId);
        await Promise.all([
          ...filesToAddPromises,
          ...filesToRemovePromises
        ]);
      }

      this.setState({ saving: false, saved: true, errors: {}, submitState: 'success' });
      if (redirect && projectId) {
        clHistory.push(`/admin/projects/${projectId}/events/`);
      }

    } catch (errors) {
      this.setState({ saving: false, errors: errors.json.errors, submitState: 'error' });
    }

  }

  render() {
    const { locale, currentTenant, loaded, submitState } = this.state;

    if (locale && currentTenant && loaded) {
      const { errors, event, attributeDiff, saving, localEventFiles } = this.state;
      const eventAttrs = event ?  { ...event.data.attributes, ...attributeDiff } : { ...attributeDiff };

      return (
        <>
          <SectionTitle>
            {event && <FormattedMessage {...messages.editEventTitle} />}
            {!event && <FormattedMessage {...messages.newEventTitle} />}
          </SectionTitle>

          <form className="e2e-project-event-edit" onSubmit={this.handleOnSubmit}>
            <Section>
              <SectionField>
                <InputMultiloc
                  id="title"
                  label={<FormattedMessage {...messages.titleLabel} />}
                  type="text"
                  valueMultiloc={eventAttrs.title_multiloc}
                  onChange={this.handleTitleMultilocOnChange}
                />
                <ErrorComponent apiErrors={errors.title_multiloc} />
              </SectionField>

              <SectionField>
                <InputMultiloc
                  id="location"
                  label={<FormattedMessage {...messages.locationLabel} />}
                  type="text"
                  valueMultiloc={eventAttrs.location_multiloc}
                  onChange={this.handleLocationMultilocOnChange}
                />
                <ErrorComponent apiErrors={errors.location_multiloc} />
              </SectionField>

              <SectionField>
                <Label><FormattedMessage {...messages.dateStartLabel} /></Label>
                <DateTimePicker value={eventAttrs.start_at} onChange={this.handleDateTimePickerOnChange('start_at')} />
                <ErrorComponent apiErrors={errors.start_at} />
              </SectionField>

              <SectionField>
                <Label><FormattedMessage {...messages.datesEndLabel} /></Label>
                <DateTimePicker value={eventAttrs.end_at} onChange={this.handleDateTimePickerOnChange('end_at')} />
                <ErrorComponent apiErrors={errors.end_at} />
              </SectionField>

              <SectionField className="fullWidth">
                <QuillMultiloc
                  id="description"
                  inAdmin
                  label={<FormattedMessage {...messages.descriptionLabel} />}
                  valueMultiloc={eventAttrs.description_multiloc}
                  onChangeMultiloc={this.handleDescriptionMultilocOnChange}
                />
                <ErrorComponent apiErrors={errors.description_multiloc} />
              </SectionField>

              <SectionField>
                <FileUploader
                  onFileAdd={this.handleEventFileOnAdd}
                  onFileRemove={this.handleEventFileOnRemove}
                  localFiles={localEventFiles}
                  errors={errors}
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
  }
}

export default (props: Props) => (
  <GetResourceFileObjects resourceId={props.params.id} resourceType="event">
    {remoteEventFiles => <AdminProjectEventEdit remoteEventFiles={remoteEventFiles} {...props} />}
  </GetResourceFileObjects>
);
