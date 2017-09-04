// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { IStream } from 'utils/streams';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectSetting } from 'utils/tenant/selectors';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import messages from './messages';
import * as moment from 'moment';
import { EditorState, ContentState, convertToRaw, convertFromHTML } from 'draft-js';
import draftjsToHtml from 'draftjs-to-html';
import { withRouter } from 'react-router';
import { API } from 'typings.d';

// Services
import { projectStream, IProject, IProjectData } from 'services/projects';
import { eventStream, updateEvent, addEvent, IEvent, IEventData, IEvents, IUpdatedEventProperties } from 'services/events';
import { injectIntl, FormattedMessage } from 'react-intl';
import { injectTFunc } from 'utils/containers/t/utils';

// Components
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import TextArea from 'components/UI/TextArea';
import Editor from 'components/UI/Editor';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

import FieldWrapper from 'components/admin/FieldWrapper';
import DateTimePicker from 'components/admin/DateTimePicker';
import SubmitWrapper from 'components/admin/SubmitWrapper';


// Component typing
type Props = {
  params: {
    id: string | null,
    slug: string | null,
  },
  locale: string,
  tFunc: Function,
  router: any,
  project: IProjectData | null;
};

interface State {
  event: IEventData | null;
  attributeDiff: IUpdatedEventProperties;
  errors: {
    [fieldName: string]: API.Error[]
  };
  saving: boolean;
  focusedInput: 'START_DATE' | 'END_DATE' | null;
  descState: EditorState;
  saved: boolean;
}

class AdminProjectEventEdit extends React.Component<Props, State> {
  event$: IStream<Event>;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
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

  getSubmitState = (): 'disabled' | 'enabled' | 'error' | 'success' => {
    if (!_.isEmpty(this.state.errors)) {
      return 'error';
    }
    if (this.state.saved && _.isEmpty(this.state.attributeDiff)) {
      return 'success';
    }
    return _.isEmpty(this.state.attributeDiff) ? 'disabled' : 'enabled';
  }

  componentDidMount() {
    if (this.props.params.id) {
      this.subscriptions = [
        eventStream(this.props.params.id).observable.subscribe((event) => {
          let descState = EditorState.createEmpty();

          if (event) {
            const blocksFromHtml = convertFromHTML(event.data.attributes.description_multiloc[this.props.locale]);
            const editorContent = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);
            descState = EditorState.createWithContent(editorContent);
          }

          this.setState({
            descState,
            event: event ? event.data : null,
          });
        })
      ];
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
      savingPromise = updateEvent(this.state.event.id, this.state.attributeDiff);
      this.setState({ saving: true });
    } else if (this.props.project) {
      savingPromise = addEvent(this.props.project.id, this.state.attributeDiff).then((response) => {
        this.props.router.push(`/admin/projects/${this.props.params.slug}/events/${response.data.id}`);
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
    const eventAttrs = this.state.event
    ?  { ...this.state.event.attributes, ...this.state.attributeDiff }
    : { ...this.state.attributeDiff };

    const submitState = this.getSubmitState();

    return (
      <div>
        <h1>
          {this.state.event && <FormattedMessage {...messages.editEventTitle} />}
          {!this.state.event && <FormattedMessage {...messages.createEventTitle} />}

        </h1>

        <form onSubmit={this.handleOnSubmit}>
          <FieldWrapper>
            <Label htmlFor="title"><FormattedMessage {...messages.titleLabel} /></Label>
            <Input
              id="title"
              type="text"
              value={this.props.tFunc(eventAttrs.title_multiloc)}
              onChange={this.createMultilocUpdater('title_multiloc')}
            />
            <Error apiErrors={this.state.errors.title_multiloc} />
          </FieldWrapper>

          <FieldWrapper>
            <Label htmlFor="location"><FormattedMessage {...messages.locationLabel} /></Label>
            <Input
              id="location"
              type="text"
              value={this.props.tFunc(eventAttrs.location_multiloc)}
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
}

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
});

export default injectTFunc(injectIntl(connect(mapStateToProps)(withRouter(AdminProjectEventEdit))));
