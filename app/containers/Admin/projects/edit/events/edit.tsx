import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import { isEmpty } from 'lodash';

// libraries
import clHistory from 'utils/cl-router/history';

// components
import Label from 'components/UI/Label';
import InputMultiloc from 'components/UI/InputMultiloc';
import QuillMultiloc from 'components/QuillEditor/QuillMultiloc';
import Error from 'components/UI/Error';
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

// typings
import { Multiloc, API, Locale } from 'typings';

type Props = {
  params: {
    id: string | null,
    projectId: string | null,
  },
  project: IProjectData | null;
};

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
}

export default class AdminProjectEventEdit extends React.PureComponent<Props, State> {
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
      loaded: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const event$ = (this.props.params.id ? eventStream(this.props.params.id).observable : Rx.Observable.of(null));

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        event$
      ).subscribe(([locale, currentTenant, event]) => {
        this.setState({ locale, currentTenant, event, loaded: true });
      })
    ];
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

  handleOnSubmit = (event) => {
    event.preventDefault();

    if (!isEmpty(this.state.attributeDiff)) {
      let savingPromise: Promise<IEvent> | null = null;

      if (this.state.event) {
        savingPromise = updateEvent(this.state.event.data.id, this.state.attributeDiff);
      } else if (this.props.project) {
        savingPromise = addEvent(this.props.project.id, this.state.attributeDiff).then((response) => {
          clHistory.push(`/admin/projects/${this.props.params.projectId}/events/${response.data.id}`);
          return response;
        });
      }

      if (savingPromise) {
        this.setState({ saving: true, saved: false });

        savingPromise.then((response) => {
          this.setState({ saving: false, saved: true, attributeDiff: {}, event: response, errors: {} });
        }).catch((e) => {
          this.setState({ saving: false, errors: e.json.errors });
        });
      }
    }
  }

  render() {
    const { locale, currentTenant, loaded } = this.state;

    if (locale && currentTenant && loaded) {
      const { errors, saved, event, attributeDiff, saving } = this.state;
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
                <Error apiErrors={errors.title_multiloc} />
              </SectionField>

              <SectionField>
                <InputMultiloc
                  id="location"
                  label={<FormattedMessage {...messages.locationLabel} />}
                  type="text"
                  valueMultiloc={eventAttrs.location_multiloc}
                  onChange={this.handleLocationMultilocOnChange}
                />
                <Error apiErrors={errors.location_multiloc} />
              </SectionField>

              <SectionField>
                <Label><FormattedMessage {...messages.dateStartLabel} /></Label>
                <DateTimePicker value={eventAttrs.start_at} onChange={this.handleDateTimePickerOnChange('start_at')} />
                <Error apiErrors={errors.start_at} />
              </SectionField>

              <SectionField>
                <Label><FormattedMessage {...messages.datesEndLabel} /></Label>
                <DateTimePicker value={eventAttrs.end_at} onChange={this.handleDateTimePickerOnChange('end_at')} />
                <Error apiErrors={errors.end_at} />
              </SectionField>

              <SectionField className="fullWidth">
                <QuillMultiloc
                  id="description"
                  inAdmin
                  label={<FormattedMessage {...messages.descriptionLabel} />}
                  valueMultiloc={eventAttrs.description_multiloc}
                  onChangeMultiloc={this.handleDescriptionMultilocOnChange}
                />
                <Error apiErrors={errors.description_multiloc} />
              </SectionField>

              {/* <SectionField>
                <Label>
                  <FormattedMessage {...messages.fileUploadLabel} />
                </Label>
                <FileInput
                  onAdd={this.handlePhaseFileOnAdd}
                />
                {Array.isArray(localEventFiles) && localEventFiles.map(file => (
                  <FileDisplay
                    key={file.id || file.name}
                    onDeleteClick={this.handlePhaseFileOnRemove(file)}
                    file={file}
                  />)
                )}
              </SectionField> */}
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
