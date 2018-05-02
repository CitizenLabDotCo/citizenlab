import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import { get, isEmpty, forOwn } from 'lodash';

// libraries
import { browserHistory } from 'react-router';

// components
import Label from 'components/UI/Label';
import InputMultiloc from 'components/UI/InputMultiloc';
import EditorMultiloc from 'components/UI/EditorMultiloc';
import Error from 'components/UI/Error';
import DateTimePicker from 'components/admin/DateTimePicker';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';

// utils
import unsubscribe from 'utils/unsubscribe';
import getSubmitState from 'utils/getSubmitState';
import { getHtmlStringFromEditorState, getEditorStateFromHtmlString } from 'utils/editorTools';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { IProjectData } from 'services/projects';
import { eventStream, updateEvent, addEvent, IEvent, IUpdatedEventProperties } from 'services/events';

// typings
import { Multiloc, MultilocEditorState, API, Locale } from 'typings';

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
  descriptionMultilocEditorState: MultilocEditorState | null;
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
      descriptionMultilocEditorState: null,
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
        let descriptionMultilocEditorState: MultilocEditorState | null = null;

        if (event) {
          descriptionMultilocEditorState = {};

          forOwn(event.data.attributes.description_multiloc, (htmlValue, locale) => {
            (descriptionMultilocEditorState as MultilocEditorState)[locale] = getEditorStateFromHtmlString(htmlValue);
          });
        }

        this.setState({ locale, currentTenant, event, descriptionMultilocEditorState, loaded: true });
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

  handleDescriptionMultilocEditorStateOnChange = (descriptionMultilocEditorState: MultilocEditorState, locale: Locale) => {
    this.setState((state) => ({
      descriptionMultilocEditorState,
      attributeDiff: {
        ...state.attributeDiff,
        description_multiloc: {
          ...get(state, 'event.data.attributes.description_multiloc', {}),
          ...get(state.attributeDiff, 'description_multiloc', {}),
          [locale]: getHtmlStringFromEditorState(descriptionMultilocEditorState[locale])
        }
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
          browserHistory.push(`/admin/projects/${this.props.params.projectId}/events/${response.data.id}`);
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
      const { errors, saved, event, attributeDiff, descriptionMultilocEditorState, saving } = this.state;
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

              <SectionField>
                <EditorMultiloc
                  id="description"
                  label={<FormattedMessage {...messages.descriptionLabel} />}
                  valueMultiloc={descriptionMultilocEditorState}
                  onChange={this.handleDescriptionMultilocEditorStateOnChange}
                />
                <Error apiErrors={errors.description_multiloc} />
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
