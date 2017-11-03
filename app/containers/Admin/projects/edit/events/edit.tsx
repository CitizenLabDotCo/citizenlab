import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { Multiloc, API } from 'typings.d';

// libraries
import * as moment from 'moment';
import { browserHistory } from 'react-router';
import { EditorState, ContentState, convertToRaw, convertFromHTML } from 'draft-js';
import draftjsToHtml from 'draftjs-to-html';

// components
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import TextArea from 'components/UI/TextArea';
import Editor from 'components/UI/Editor';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import FieldWrapper from 'components/admin/FieldWrapper';
import DateTimePicker from 'components/admin/DateTimePicker';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// utils
import { IStream } from 'utils/streams';

// i18n
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { projectBySlugStream, IProject, IProjectData } from 'services/projects';
import { eventStream, updateEvent, addEvent, IEvent, IEventData, IEvents, IUpdatedEventProperties } from 'services/events';

type Props = {
  params: {
    id: string | null,
    slug: string | null,
  },
  locale: string,
  project: IProjectData | null;
};

interface State {
  locale: string | null;
  currentTenant: ITenant | null;
  event: IEvent | null;
  attributeDiff: IUpdatedEventProperties;
  errors: {
    [fieldName: string]: API.Error[]
  };
  saving: boolean;
  focusedInput: 'START_DATE' | 'END_DATE' | null;
  descState: EditorState;
  saved: boolean;
}

class AdminProjectEventEdit extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
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
        let descState = EditorState.createEmpty();

        if (event) {
          const blocksFromHtml = convertFromHTML(_.get(event, `data.attributes.description_multiloc.${this.props.locale}`, ''));
          const editorContent = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);
          descState = EditorState.createWithContent(editorContent);
        }

        this.setState({ locale, currentTenant, event, descState });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getSubmitState = (): 'disabled' | 'enabled' | 'error' | 'success' => {
    if (!_.isEmpty(this.state.errors)) {
      return 'error';
    } else if (this.state.saved && _.isEmpty(this.state.attributeDiff)) {
      return 'success';
    }

    return _.isEmpty(this.state.attributeDiff) ? 'disabled' : 'enabled';
  }

  createMultilocUpdater = (name: string) => (value: string) => {
    if (this.state.attributeDiff) {
      const newValue = this.state.attributeDiff && this.state.attributeDiff[name] || {};
      newValue[this.props.locale] = value;
      this.setState({
        attributeDiff: { ...this.state.attributeDiff, [name]: newValue },
      });
    }
  }

  handleDescChange = (newState: EditorState) => {
    const htmlValue = draftjsToHtml(convertToRaw(newState.getCurrentContent()));
    if (this.state.attributeDiff) {
      const newValue = this.state.attributeDiff && this.state.attributeDiff.description_multiloc || {};
      newValue[this.props.locale] = htmlValue;
      this.setState({
        attributeDiff: { ...this.state.attributeDiff, description_multiloc: newValue },
        descState: newState,
      });
    }
  }

  createDateChangeHandler = (target: 'start_at' | 'end_at') => {
    return (moment) => {
      const newAttributesDiff = this.state.attributeDiff;
      newAttributesDiff[target] = moment ? moment.toISOString() :  '';
      this.setState({ attributeDiff: newAttributesDiff });
    };
  }

  handleDateFocusChange = (focusedInput) => {
    this.setState({ focusedInput });
  }

  isOutsideRange = (day) => {
    return false;
  }

  handleOnSubmit = (event) => {
    event.preventDefault();
    if (_.isEmpty(this.state.attributeDiff)) {
      return;
    }

    let savingPromise;

    if (this.state.event) {
      savingPromise = updateEvent(this.state.event.data.id, this.state.attributeDiff);
      this.setState({ saving: true });
    } else if (this.props.project) {
      savingPromise = addEvent(this.props.project.id, this.state.attributeDiff).then((response) => {
        browserHistory.push(`/admin/projects/${this.props.params.slug}/events/${response.data.id}`);
        return response;
      });
    }

    this.setState({ saving: true, saved: false });

    savingPromise.catch((e) => {
      this.setState({ saving: false, errors: e.json.errors });
    }).then((response) => {
      this.setState({ saving: false, saved: true, attributeDiff: {}, event: response.data });
    });
  }

  render() {
    const { locale, currentTenant } = this.state;
    const eventAttrs = this.state.event ?  { ...this.state.event.data.attributes, ...this.state.attributeDiff } : { ...this.state.attributeDiff };
    const submitState = this.getSubmitState();

    if (locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;

      return (
        <div>
          <h1>
            {this.state.event && <FormattedMessage {...messages.editEventTitle} />}
            {!this.state.event && <FormattedMessage {...messages.createEventTitle} />}
          </h1>

          <form className="e2e-project-event-edit" onSubmit={this.handleOnSubmit}>
            <FieldWrapper>
              <Label htmlFor="title"><FormattedMessage {...messages.titleLabel} /></Label>
              <Input
                id="title"
                type="text"
                value={getLocalized(eventAttrs.title_multiloc as Multiloc, locale, currentTenantLocales)}
                onChange={this.createMultilocUpdater('title_multiloc')}
              />
              <Error apiErrors={this.state.errors.title_multiloc} />
            </FieldWrapper>

            <FieldWrapper>
              <Label htmlFor="location"><FormattedMessage {...messages.locationLabel} /></Label>
              <Input
                id="location"
                type="text"
                value={getLocalized(eventAttrs.location_multiloc as Multiloc, locale, currentTenantLocales)}
                onChange={this.createMultilocUpdater('location_multiloc')}
              />
              <Error apiErrors={this.state.errors.location_multiloc} />
            </FieldWrapper>

            <FieldWrapper>
              <Label><FormattedMessage {...messages.dateStartLabel} /></Label>
              <DateTimePicker value={eventAttrs.start_at} onChange={this.createDateChangeHandler('start_at')} />
            </FieldWrapper>

            <FieldWrapper>
              <Label><FormattedMessage {...messages.datesEndLabel} /></Label>
              <DateTimePicker value={eventAttrs.end_at} onChange={this.createDateChangeHandler('end_at')} />
            </FieldWrapper>

            <FieldWrapper>
              <Label htmlFor="description"><FormattedMessage {...messages.descriptionLabel} /></Label>
              <Editor
                id="description"
                placeholder=""
                value={this.state.descState}
                error=""
                onChange={this.handleDescChange}
              />
              <Error apiErrors={this.state.errors.description_multiloc} />
            </FieldWrapper>

            <SubmitWrapper
              loading={this.state.saving}
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
        </div>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(AdminProjectEventEdit);
