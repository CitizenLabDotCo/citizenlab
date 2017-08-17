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

// Services
import { observeProject, IProject, IProjectData } from 'services/projects';
import { observeEvent, updateEvent, Event, EventData, UpdatedEvent, saveEvent } from 'services/events';
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


// Component typing
type Props = {
  params: {
    id: string | null,
    slug: string | null,
  },
  locale: string,
  tFunc: Function,
  router: any,
};

interface State {
  project: IProjectData | null;
  event: EventData | null;
  attributeDiff: UpdatedEvent;
  errors: {
    [key: string]: string[]
  };
  saving: boolean;
  focusedInput: 'START_DATE' | 'END_DATE' | null;
  descState: EditorState;
}

class AdminProjectTimelineEdit extends React.Component<Props, State> {
  project$: IStream<IProject>;
  event$: IStream<Event>;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      project: null,
      event: null,
      attributeDiff: {},
      errors: {
        title: [],
        description: [],
        location: [],
      },
      saving: false,
      focusedInput: null,
      descState: EditorState.createEmpty(),
    };
    if (props.params.slug) {
      this.project$ = observeProject(props.params.slug);
    }
    if (props.params.id) {
      this.event$ = observeEvent(props.params.id);
    }
    this.subscriptions = [];
  }

  componentDidMount() {
    let dataLoading;
    if (this.event$) {
      dataLoading = Rx.Observable.combineLatest(
        this.project$.observable,
        this.event$.observable,
        (project, event) => ({ project, event })
      );
    } else {
      dataLoading = Rx.Observable.combineLatest(
        this.project$.observable,
        (project) => ({ project })
      );
    }


    if (this.project$ || this.event$) {
      this.subscriptions = [
        dataLoading
        .subscribe(({ project, event }) => {
          let descState = EditorState.createEmpty();

          if (event) {
            const blocksFromHtml = convertFromHTML(event.data.attributes.description_multiloc[this.props.locale]);
            const editorContent = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);
            descState = EditorState.createWithContent(editorContent);
          }

          this.setState({
            descState,
            project: project ? project.data : null,
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

  handleDateUpdate = ({ startDate, endDate }) => {
    const newAttributesDiff = this.state.attributeDiff;
    newAttributesDiff.start_at = startDate ? startDate.format('YYYY-MM-DD') : '';
    newAttributesDiff.end_at = endDate ? endDate.format('YYYY-MM-DD') : '';
    this.setState({ attributeDiff: newAttributesDiff });
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

    if (this.state.event) {
      this.setState({ saving: true });
      updateEvent(this.state.event.id, this.state.attributeDiff)
      .then(() => {
        this.setState({ saving: false });
      })
      .catch((errors) => {
        // TODO: Update state with errors from the API
      });
    } else if (this.state.project) {
      this.setState({ saving: true });
      saveEvent(this.state.project.id, this.state.attributeDiff)
      .then((response) => {
        this.props.router.push(`/admin/projects/${this.props.params.slug}/timeline/${response.data.id}`);
      })
      .then(() => {
        this.setState({ saving: false });
      });
    }
  }

  render() {
    const eventAttrs = this.state.event
    ?  { ...this.state.event.attributes, ...this.state.attributeDiff }
    : { ...this.state.attributeDiff };

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
            <Error text={this.state.errors.title.join(', ')} />
          </FieldWrapper>

          <FieldWrapper>
            <Label htmlFor="location"><FormattedMessage {...messages.locationLabel} /></Label>
            <Input
              id="location"
              type="text"
              value={this.props.tFunc(eventAttrs.location_multiloc)}
              onChange={this.createMultilocUpdater('location_multiloc')}
            />
            <Error text={this.state.errors.location.join(', ')} />
          </FieldWrapper>

          <FieldWrapper>
            <Label><FormattedMessage {...messages.datesLabel} /></Label>
            <DateRangePicker
              startDate={eventAttrs.start_at ? moment(eventAttrs.start_at) : null} // momentPropTypes.momentObj or null,
              endDate={eventAttrs.end_at ? moment(eventAttrs.end_at) : null} // momentPropTypes.momentObj or null,
              onDatesChange={this.handleDateUpdate} // PropTypes.func.isRequired,
              focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
              onFocusChange={this.handleDateFocusChange} // PropTypes.func.isRequired,
              isOutsideRange={this.isOutsideRange}
              firstDayOfWeek={1}
              displayFormat="DD/MM/YYYY"
            />
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
            <Error text={this.state.errors.description.join(', ')} />
          </FieldWrapper>

          <Button loading={this.state.saving} ><FormattedMessage {...messages.saveButtonLabel} /></Button>
        </form>
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
});

export default injectTFunc(injectIntl(connect(mapStateToProps)(withRouter(AdminProjectTimelineEdit))));
