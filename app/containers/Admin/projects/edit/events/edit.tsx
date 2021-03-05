import React, { PureComponent } from 'react';
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
import { IconTooltip, Label } from 'cl2-component-library';

// utils
import unsubscribe from 'utils/unsubscribe';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// services
import { localeStream } from 'services/locale';
import {
  currentAppConfigurationStream,
  IAppConfiguration,
} from 'services/appConfiguration';
import { IProjectData } from 'services/projects';
import {
  eventStream,
  updateEvent,
  addEvent,
  IEvent,
  IUpdatedEventProperties,
} from 'services/events';
import { addEventFile, deleteEventFile } from 'services/eventFiles';

// resources
import GetResourceFileObjects, {
  GetResourceFileObjectsChildProps,
} from 'resources/GetResourceFileObjects';

// typings
import { Multiloc, CLError, Locale, UploadFile } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';

interface DataProps {
  remoteEventFiles: GetResourceFileObjectsChildProps;
}

interface Props extends DataProps {
  params: {
    id: string | null;
    projectId: string | null;
  };
  project: IProjectData | null;
}

interface State {
  locale: Locale | null;
  currentTenant: IAppConfiguration | null;
  event: IEvent | null;
  attributeDiff: IUpdatedEventProperties;
  errors:
    | {
        [fieldName: string]: CLError[];
      }
    | Error;
  saving: boolean;
  focusedInput: 'startDate' | 'endDate' | null;
  saved: boolean;
  loaded: boolean;
  eventFiles: UploadFile[];
  eventFilesToRemove: UploadFile[];
  submitState: 'disabled' | 'enabled' | 'error' | 'success';
}

class AdminProjectEventEdit extends PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
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
      eventFiles: [],
      eventFilesToRemove: [],
      submitState: 'disabled',
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { remoteEventFiles } = this.props;
    const locale$ = localeStream().observable;
    const currentTenant$ = currentAppConfigurationStream().observable;
    const event$ = this.props.params.id
      ? eventStream(this.props.params.id).observable
      : of(null);

    this.subscriptions = [
      combineLatest(locale$, currentTenant$, event$).subscribe(
        ([locale, currentTenant, event]) => {
          this.setState({
            locale,
            currentTenant,
            event,
            loaded: true,
          });
        }
      ),
    ];

    this.setState({
      eventFiles: !isNilOrError(remoteEventFiles) ? remoteEventFiles : [],
    });
  }

  componentDidUpdate(prevProps: Props) {
    const { remoteEventFiles } = this.props;

    if (prevProps.remoteEventFiles !== remoteEventFiles) {
      this.setState({
        eventFiles: !isNilOrError(remoteEventFiles) ? remoteEventFiles : [],
      });
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
        title_multiloc: titleMultiloc,
      },
    }));
  };

  handleLocationMultilocOnChange = (locationMultiloc: Multiloc) => {
    this.setState((state) => ({
      submitState: 'enabled',
      attributeDiff: {
        ...state.attributeDiff,
        location_multiloc: locationMultiloc,
      },
    }));
  };

  handleDescriptionMultilocOnChange = (descriptionMultiloc: Multiloc) => {
    this.setState((state) => ({
      submitState: 'enabled',
      attributeDiff: {
        ...state.attributeDiff,
        description_multiloc: descriptionMultiloc,
      },
    }));
  };

  handleDateTimePickerOnChange = (name: 'start_at' | 'end_at') => (
    moment: moment.Moment
  ) => {
    this.setState((state) => ({
      submitState: 'enabled',
      attributeDiff: {
        ...state.attributeDiff,
        [name]: moment.toISOString(),
      },
      errors: {},
    }));
  };

  handleEventFileOnAdd = (newFile: UploadFile) => {
    this.setState((prevState) => ({
      submitState: 'enabled',
      eventFiles: [...prevState.eventFiles, newFile],
    }));
  };

  handleEventFileOnRemove = (eventFileToRemove: UploadFile) => {
    this.setState((prevState) => ({
      submitState: 'enabled',
      eventFiles: prevState.eventFiles.filter(
        (eventFile) => eventFile.base64 !== eventFileToRemove.base64
      ),
      eventFilesToRemove: [...prevState.eventFilesToRemove, eventFileToRemove],
    }));
  };

  handleOnSubmit = async (e) => {
    e.preventDefault();

    if (!isNilOrError(this.props.project)) {
      const projectId = this.props.project.id;
      const { event, eventFiles, eventFilesToRemove } = this.state;
      let eventResponse = event;
      let redirect = false;

      try {
        this.setState({ saving: true, saved: false });

        // non-file input fields have changed
        if (!isEmpty(this.state.attributeDiff)) {
          // event already exists (in the state)
          if (event) {
            eventResponse = await updateEvent(
              event.data.id,
              this.state.attributeDiff
            );
            this.setState({ event: eventResponse, attributeDiff: {} });
          } else if (projectId) {
            // event doesn't exist, create with project id
            eventResponse = await addEvent(projectId, this.state.attributeDiff);
            this.setState({ event: eventResponse, attributeDiff: {} });
            redirect = true;
          }
        }

        if (eventResponse) {
          const { id: eventId } = eventResponse.data;
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

        this.setState({
          saving: false,
          saved: true,
          errors: {},
          submitState: 'success',
          eventFilesToRemove: [],
        });

        if (redirect && projectId) {
          clHistory.push(`/admin/projects/${projectId}/events/`);
        }
      } catch (errors) {
        if (isCLErrorJSON(errors)) {
          this.setState({
            saving: false,
            errors: errors.json.errors,
            submitState: 'error',
          });
        } else {
          this.setState({ saving: false, submitState: 'error' });
        }
      }
    }
  };

  descriptionLabel = (<FormattedMessage {...messages.descriptionLabel} />);

  render() {
    const { locale, currentTenant, loaded, submitState } = this.state;

    if (locale && currentTenant && loaded) {
      const { errors, event, attributeDiff, saving, eventFiles } = this.state;
      const eventAttrs = event
        ? { ...event.data.attributes, ...attributeDiff }
        : { ...attributeDiff };

      return (
        <>
          <SectionTitle>
            {event && <FormattedMessage {...messages.editEventTitle} />}
            {!event && <FormattedMessage {...messages.newEventTitle} />}
          </SectionTitle>

          <form
            className="e2e-project-event-edit"
            onSubmit={this.handleOnSubmit}
          >
            <Section>
              <SectionField>
                <InputMultilocWithLocaleSwitcher
                  id="title"
                  label={<FormattedMessage {...messages.titleLabel} />}
                  type="text"
                  valueMultiloc={eventAttrs.title_multiloc}
                  onChange={this.handleTitleMultilocOnChange}
                />
                <ErrorComponent apiErrors={get(errors, 'title_multiloc')} />
              </SectionField>

              <SectionField>
                <InputMultilocWithLocaleSwitcher
                  id="location"
                  label={<FormattedMessage {...messages.locationLabel} />}
                  type="text"
                  valueMultiloc={eventAttrs.location_multiloc}
                  onChange={this.handleLocationMultilocOnChange}
                />
                <ErrorComponent apiErrors={get(errors, 'location_multiloc')} />
              </SectionField>

              <SectionField>
                <Label>
                  <FormattedMessage {...messages.dateStartLabel} />
                </Label>
                <DateTimePicker
                  value={eventAttrs.start_at}
                  onChange={this.handleDateTimePickerOnChange('start_at')}
                />
                <ErrorComponent apiErrors={get(errors, 'start_at')} />
              </SectionField>

              <SectionField>
                <Label>
                  <FormattedMessage {...messages.datesEndLabel} />
                </Label>
                <DateTimePicker
                  value={eventAttrs.end_at}
                  onChange={this.handleDateTimePickerOnChange('end_at')}
                />
                <ErrorComponent apiErrors={get(errors, 'end_at')} />
              </SectionField>

              <SectionField className="fullWidth">
                <QuillMultilocWithLocaleSwitcher
                  id="description"
                  label={this.descriptionLabel}
                  valueMultiloc={eventAttrs.description_multiloc}
                  onChange={this.handleDescriptionMultilocOnChange}
                  withCTAButton
                />
                <ErrorComponent
                  apiErrors={get(errors, 'description_multiloc')}
                />
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
                  onFileAdd={this.handleEventFileOnAdd}
                  onFileRemove={this.handleEventFileOnRemove}
                  files={eventFiles}
                  errors={isError(errors) ? undefined : errors}
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
    {(remoteEventFiles) => (
      <AdminProjectEventEdit remoteEventFiles={remoteEventFiles} {...props} />
    )}
  </GetResourceFileObjects>
);
