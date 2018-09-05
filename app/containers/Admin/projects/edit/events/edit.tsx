import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import { isEmpty } from 'lodash';
import { isNilOrError } from 'utils/helperUtils';

// libraries
import clHistory from 'utils/cl-router/history';

// components
import Label from 'components/UI/Label';
import InputMultiloc from 'components/UI/InputMultiloc';
import QuillMultiloc from 'components/QuillEditor/QuillMultiloc';
import ErrorComponent from 'components/UI/Error';
import DateTimePicker from 'components/admin/DateTimePicker';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import FileInput from 'components/UI/FileInput';
import FileDisplay from 'components/UI/FileDisplay';

// utils
import unsubscribe from 'utils/unsubscribe';
import getSubmitState from 'utils/getSubmitState';

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
import { Multiloc, API, Locale, UploadFile } from 'typings';

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
    [fieldName: string]: API.Error[]
  };
  saving: boolean;
  focusedInput: 'startDate' | 'endDate' | null;
  saved: boolean;
  loaded: boolean;
  localEventFiles: GetResourceFileObjectsChildProps;
  isNewEvent: boolean;
}

class AdminProjectEventEdit extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

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
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const event$ = (this.props.params.id ? eventStream(this.props.params.id).observable : Rx.Observable.of(null));
    const { remoteEventFiles } = this.props;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        event$
      ).subscribe(([locale, currentTenant, event]) => {
        this.setState({ locale, currentTenant, event, loaded: true, isNewEvent: event === null });
      })
    ];

    this.setState({ localEventFiles: remoteEventFiles });
  }

  componentWillUnmount() {
    unsubscribe(this.subscriptions);
  }

  handleTitleMultilocOnChange = (titleMultiloc: Multiloc) => {
    this.setState((state) => ({
      attributeDiff: {
        ...state.attributeDiff,
        title_multiloc: titleMultiloc
      }
    }));
  }

  handleLocationMultilocOnChange = (locationMultiloc: Multiloc) => {
    this.setState((state) => ({
      attributeDiff: {
        ...state.attributeDiff,
        location_multiloc: locationMultiloc
      }
    }));
  }

  handleDescriptionMultilocOnChange = (descriptionMultiloc: Multiloc) => {
    this.setState((state) => ({
      attributeDiff: {
        ...state.attributeDiff,
        description_multiloc: descriptionMultiloc
      }
    }));
  }

  handleDateTimePickerOnChange = (name: 'start_at' | 'end_at') => (moment: moment.Moment) => {
    this.setState((state) => ({
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
        localEventFiles = prevState.localEventFiles.filter(eventFile => eventFile.name !== removedFile.name);
      }

      return {
        localEventFiles
      };
    });
  }

  getFilesToAddPromises = () => {
    const { localEventFiles } = this.state;
    const { remoteEventFiles } = this.props;
    const { id } = this.props.params;
    let filesToAdd = localEventFiles;
    let filesToAddPromises: Promise<any>[] = [];

    if (!isNilOrError(localEventFiles) && Array.isArray(remoteEventFiles)) {
      // localEventFiles = local state of files
      // This means those previously uploaded + files that have been added/removed
      // remoteEventFiles = last saved state of files (remote)

      filesToAdd = localEventFiles.filter((localEventFile) => {
        return !remoteEventFiles.some(remoteEventFile => remoteEventFile.name === localEventFile.name);
      });
    }

    if (id && !isNilOrError(filesToAdd) && filesToAdd.length > 0) {
      filesToAddPromises = filesToAdd.map((fileToAdd: any) => addEventFile(id as string, fileToAdd.base64, fileToAdd.name));
    }
    debugger;
    return filesToAddPromises;
  }

  getFilesToRemovePromises = () => {
    const { localEventFiles } = this.state;
    const { remoteEventFiles } = this.props;
    const { id } = this.props.params;
    let filesToRemove = remoteEventFiles;
    let filesToRemovePromises: Promise<any>[] = [];

    if (!isNilOrError(localEventFiles) && Array.isArray(remoteEventFiles)) {
      // localEventFiles = local state of files
      // This means those previously uploaded + files that have been added/removed
      // remoteEventFiles = last saved state of files (remote)

      filesToRemove = remoteEventFiles.filter((remoteEventFile) => {
        return !localEventFiles.some(localEventFile => localEventFile.name === remoteEventFile.name);
      });
    }

    if (id && !isNilOrError(filesToRemove) && filesToRemove.length > 0) {
      filesToRemovePromises = filesToRemove.map((fileToRemove: any) => deleteEventFile(id as string, fileToRemove.id));
    }

    return filesToRemovePromises;
  }

  handleOnSubmit = async (event) => {
    event.preventDefault();
    let savingPromise: Promise<IEvent> | null = null;
    const filesToAddPromises: Promise<any>[] = this.getFilesToAddPromises();
    const filesToRemovePromises: Promise<any>[] = this.getFilesToRemovePromises();

    if (!isEmpty(this.state.attributeDiff)) {

      if (this.state.event) {
        savingPromise = updateEvent(this.state.event.data.id, this.state.attributeDiff);
      } else if (this.props.project) {
        savingPromise = addEvent(this.props.project.id, this.state.attributeDiff).then((response) => {
          clHistory.push(`/admin/projects/${this.props.params.projectId}/events/${response.data.id}`);
          return response;
        });
      }
    }

    const allPromises = [
      savingPromise,
      ...filesToAddPromises,
      ...filesToRemovePromises
    ];

    if (allPromises.length > 0) {
      this.setState({ saving: true, saved: false });
      try {
        debugger;
        await Promise.all(allPromises);
        this.setState({ saving: false, saved: true, attributeDiff: {}, event: response, errors: {} });
      } catch (errors) {
        this.setState({ saving: false, errors: errors.json.errors });
      }
    }
  }

  render() {
    const { locale, currentTenant, loaded } = this.state;

    if (locale && currentTenant && loaded) {
      const { errors, saved, event, attributeDiff, saving, localEventFiles } = this.state;
      const eventAttrs = event ?  { ...event.data.attributes, ...attributeDiff } : { ...attributeDiff };
      const submitState = getSubmitState({ errors, saved, diff: attributeDiff });

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
                <Label>
                  <FormattedMessage {...messages.fileUploadLabel} />
                </Label>
                <FileInput
                  onAdd={this.handleEventFileOnAdd}
                />
                {Array.isArray(localEventFiles) && localEventFiles.map(file => (
                  <FileDisplay
                    key={file.id || file.name}
                    onDeleteClick={this.handleEventFileOnRemove(file)}
                    file={file}
                  />)
                )}
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
  <GetResourceFileObjects>
    {remoteEventFiles => <AdminProjectEventEdit remoteEventFiles={remoteEventFiles} {...props} />}
  </GetResourceFileObjects>
);
