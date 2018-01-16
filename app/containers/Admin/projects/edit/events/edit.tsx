import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import { get, isEmpty } from 'lodash';

// libraries
import { browserHistory } from 'react-router';
import { EditorState } from 'draft-js';

// components
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Editor from 'components/UI/Editor';
import Error from 'components/UI/Error';
import DateTimePicker from 'components/admin/DateTimePicker';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';

// utils
import unsubscribe from 'utils/unsubscribe';
import getSubmitState from 'utils/getSubmitState';
import { getHtmlStringFromEditorState, getEditorStateFromHtmlString } from 'utils/editorTools';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import localize, { injectedLocalized } from 'utils/localize';
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
    slug: string | null,
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
  descState: EditorState;
  saved: boolean;
}

class AdminProjectEventEdit extends React.PureComponent<Props & InjectedIntlProps & injectedLocalized, State> {
  subscriptions: Rx.Subscription[];

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
      descState: EditorState.createEmpty(),
      saved: false
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const event$ = (this.props.params.id ? eventStream(this.props.params.id).observable : Rx.Observable.of(null));

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        event$
      ).subscribe(([locale, currentTenant, event]) => {
        const descState = getEditorStateFromHtmlString(get(event, `data.attributes.description_multiloc.${locale}`, ''));
        this.setState({ locale, currentTenant, event, descState });
      })
    ];
  }

  componentWillUnmount() {
    unsubscribe(this.subscriptions);
  }

  createMultilocUpdater = (name: string) => (value: string) => {
    const { locale } = this.props;
    const { attributeDiff } = this.state;

    if (attributeDiff) {
      const newValue = attributeDiff && attributeDiff[name] || {};
      newValue[locale] = value;

      this.setState({
        attributeDiff: {
          ...attributeDiff,
          [name]: newValue
        }
      });
    }
  }

  handleDescChange = (editorState: EditorState) => {
    const { locale } = this.props;
    const { attributeDiff } = this.state;
    const htmlValue = getHtmlStringFromEditorState(editorState);

    if (attributeDiff) {
      const newValue = attributeDiff && attributeDiff.description_multiloc || {};
      newValue[locale] = htmlValue;

      this.setState({
        attributeDiff: {
          ...attributeDiff,
          description_multiloc: newValue
        },
        descState: editorState,
      });
    }
  }

  createDateChangeHandler = (name: 'start_at' | 'end_at') => (moment: moment.Moment) => {
    const { attributeDiff } = this.state;

    this.setState({
      attributeDiff: {
        ...attributeDiff,
        [name]: moment.toISOString()
      },
      errors: {}
    });
  }

  handleDateFocusChange = (focusedInput: 'startDate' | 'endDate') => {
    this.setState({ focusedInput });
  }

  isOutsideRange = () => {
    return false;
  }

  handleOnSubmit = (event) => {
    event.preventDefault();

    if (isEmpty(this.state.attributeDiff)) {
      return;
    }

    let savingPromise;

    if (this.state.event) {
      savingPromise = updateEvent(this.state.event.data.id, this.state.attributeDiff);
    } else if (this.props.project) {
      savingPromise = addEvent(this.props.project.id, this.state.attributeDiff).then((response) => {
        browserHistory.push(`/admin/projects/${this.props.params.slug}/events/${response.data.id}`);
        return response;
      });
    }

    this.setState({ saving: true, saved: false });

    savingPromise.then((response: IEvent) => {
      this.setState({ saving: false, saved: true, attributeDiff: {}, event: response, errors: {} });
    }).catch((e) => {
      this.setState({ saving: false, errors: e.json.errors });
    });
  }

  render() {
    const { locale, currentTenant, errors, saved, event, attributeDiff, descState, saving } = this.state;
    const eventAttrs = event ?  { ...event.data.attributes, ...attributeDiff } : { ...attributeDiff };
    const submitState = getSubmitState({ errors, saved, diff: attributeDiff });

    if (locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const title = getLocalized(eventAttrs.title_multiloc, locale, currentTenantLocales);
      const location = getLocalized(eventAttrs.location_multiloc as Multiloc, locale, currentTenantLocales);

      return (
        <>
          <SectionTitle>
            {event && <FormattedMessage {...messages.editEventTitle} />}
            {!event && <FormattedMessage {...messages.createEventTitle} />}
          </SectionTitle>

          <form className="e2e-project-event-edit" onSubmit={this.handleOnSubmit}>
            <Section>
              <SectionField>
                <Label htmlFor="title"><FormattedMessage {...messages.titleLabel} /></Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={this.createMultilocUpdater('title_multiloc')}
                />
                <Error apiErrors={errors.title_multiloc} />
              </SectionField>

              <SectionField>
                <Label htmlFor="location"><FormattedMessage {...messages.locationLabel} /></Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={this.createMultilocUpdater('location_multiloc')}
                />
                <Error apiErrors={errors.location_multiloc} />
              </SectionField>

              <SectionField>
                <Label><FormattedMessage {...messages.dateStartLabel} /></Label>
                <DateTimePicker value={eventAttrs.start_at} onChange={this.createDateChangeHandler('start_at')} />
                <Error apiErrors={errors.start_at} />
              </SectionField>

              <SectionField>
                <Label><FormattedMessage {...messages.datesEndLabel} /></Label>
                <DateTimePicker value={eventAttrs.end_at} onChange={this.createDateChangeHandler('end_at')} />
                <Error apiErrors={errors.end_at} />
              </SectionField>

              <SectionField>
                <Label htmlFor="description"><FormattedMessage {...messages.descriptionLabel} /></Label>
                <Editor
                  id="description"
                  placeholder=""
                  value={descState}
                  error=""
                  onChange={this.handleDescChange}
                />
                <Error apiErrors={errors.description_multiloc} />
              </SectionField>
            </Section>

            <SubmitWrapper
              loading={saving}
              status={submitState}
              messages={{
                buttonSave: messages.saveButtonLabel,
                buttonError: messages.saveErrorLabel,
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

export default injectIntl<Props>(localize(AdminProjectEventEdit));
