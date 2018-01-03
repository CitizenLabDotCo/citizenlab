import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { Multiloc, API } from 'typings';

// libraries
import * as moment from 'moment';
import { browserHistory } from 'react-router';
import { EditorState, ContentState, convertToRaw, convertFromHTML } from 'draft-js';

// components
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import TextArea from 'components/UI/TextArea';
import Editor from 'components/UI/Editor';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import DateTimePicker from 'components/admin/DateTimePicker';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';

// utils
import { IStream } from 'utils/streams';
import unsubscribe from 'utils/unsubscribe';
import getSubmitState from 'utils/getSubmitState';
import { getHtmlStringFromEditorState } from 'utils/editorTools';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import localize, { injectedLocalized } from 'utils/localize';
import messages from './messages';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { projectBySlugStream, IProject, IProjectData } from 'services/projects';
import { eventStream, updateEvent, addEvent, IEvent, IEventData, IEvents, IUpdatedEventProperties } from 'services/events';

// styling
import styled from 'styled-components';

const Container = styled.div`
  .SingleDatePickerInput {
    border-radius: 5px 0px 0px 5px;
  }
`;

type Props = {
  params: {
    id: string | null,
    slug: string | null,
  },
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
  focusedInput: 'startDate' | 'endDate' | null;
  descState: EditorState;
  saved: boolean;
}

class AdminProjectEventEdit extends React.PureComponent<Props & InjectedIntlProps & injectedLocalized, State> {
  state: State;
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
          const blocksFromHtml = convertFromHTML(_.get(event, `data.attributes.description_multiloc.${locale}`, ''));
          const editorContent = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);
          descState = EditorState.createWithContent(editorContent);
        }

        this.setState({ locale, currentTenant, event, descState });
      })
    ];
  }

  componentWillUnmount() {
    unsubscribe(this.subscriptions);
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

  handleDescChange = (editorState: EditorState) => {
    const htmlValue = getHtmlStringFromEditorState(editorState);

    if (this.state.attributeDiff) {
      const newValue = this.state.attributeDiff && this.state.attributeDiff.description_multiloc || {};
      newValue[this.props.locale] = htmlValue;

      this.setState({
        attributeDiff: {
          ...this.state.attributeDiff,
          description_multiloc: newValue
        },
        descState: editorState,
      });
    }
  }

  createDateChangeHandler = (target: 'start_at' | 'end_at') => {
    return (moment) => {
      const newAttributesDiff = this.state.attributeDiff;
      newAttributesDiff[target] = moment ? moment.toISOString() :  '';
      this.setState({ attributeDiff: newAttributesDiff });
    };
  }

  handleDateFocusChange = (focusedInput: 'startDate' | 'endDate') => {
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
    } else if (this.props.project) {
      savingPromise = addEvent(this.props.project.id, this.state.attributeDiff).then((response) => {
        browserHistory.push(`/admin/projects/${this.props.params.slug}/events/${response.data.id}`);
        return response;
      });
    }

    this.setState({ saving: true, saved: false });

    savingPromise
    .then((response: IEvent) => {
      this.setState({ saving: false, saved: true, attributeDiff: {}, event: response, errors: {} });
    })
    .catch((e) => {
      this.setState({ saving: false, errors: e.json.errors });
    });
  }

  render() {
    const { locale, currentTenant, errors, saved } = this.state;
    const eventAttrs = this.state.event ?  { ...this.state.event.data.attributes, ...this.state.attributeDiff } : { ...this.state.attributeDiff };
    const submitState = getSubmitState({ errors, saved, diff: this.state.attributeDiff });

    if (locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;

      return (
        <Container>
          <SectionTitle>
            {this.state.event && <FormattedMessage {...messages.editEventTitle} />}
            {!this.state.event && <FormattedMessage {...messages.createEventTitle} />}
          </SectionTitle>

          <form className="e2e-project-event-edit" onSubmit={this.handleOnSubmit}>
            <Section>
              <SectionField>
                <Label htmlFor="title"><FormattedMessage {...messages.titleLabel} /></Label>
                <Input
                  id="title"
                  type="text"
                  value={getLocalized(eventAttrs.title_multiloc as Multiloc, locale, currentTenantLocales)}
                  onChange={this.createMultilocUpdater('title_multiloc')}
                />
                <Error apiErrors={errors.title_multiloc} />
              </SectionField>

              <SectionField>
                <Label htmlFor="location"><FormattedMessage {...messages.locationLabel} /></Label>
                <Input
                  id="location"
                  type="text"
                  value={getLocalized(eventAttrs.location_multiloc as Multiloc, locale, currentTenantLocales)}
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
                  value={this.state.descState}
                  error=""
                  onChange={this.handleDescChange}
                />
                <Error apiErrors={errors.description_multiloc} />
              </SectionField>
            </Section>

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
        </Container>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(localize(AdminProjectEventEdit));
