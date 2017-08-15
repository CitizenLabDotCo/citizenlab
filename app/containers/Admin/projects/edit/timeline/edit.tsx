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

// Services
import { observeProject, IProject, IProjectData } from 'services/projects';
import { observePhase, updatePhase, IPhase, IPhaseData, IUpdatedPhase } from 'services/phases';
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

// Component typing
type Props = {
  params: {
    id: string | null,
    slug: string | null,
  },
  locale: string,
  tFunc: Function,
};

interface State {
  project: IProjectData | null;
  phase: IPhaseData | null;
  attributeDiff: IUpdatedPhase;
  errors: {
    [key: string]: string[]
  };
  saving: boolean;
  focusedInput: 'START_DATE' | 'END_DATE' | null;
  descState: EditorState;
}

class AdminProjectTimelineEdit extends React.Component<Props, State> {
  project$: IStream<IProject>;
  phase$: IStream<IPhase>;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      project: null,
      phase: null,
      attributeDiff: {},
      errors: {
        title: [],
        description: [],
      },
      saving: false,
      focusedInput: null,
      descState: EditorState.createEmpty(),
    };
    console.log(props.params.slug);
    this.project$ = observeProject(props.params.slug);
    this.phase$ = observePhase(props.params.id);
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      Rx.Observable.combineLatest(
        this.project$.observable,
        this.phase$.observable,
        (project, phase) => ({ project, phase })
      ).subscribe(({ project, phase }) => {
        const blocksFromHtml = convertFromHTML(phase.data.attributes.description_multiloc[this.props.locale]);
        const editorContent = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);


        this.setState({
          project: project.data,
          phase: phase.data,
          descState: EditorState.createWithContent(editorContent)
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  createMultilocUpdater = (name: string) => (value: string) => {
    if (this.state.phase) {
      const newValue = this.state.phase && this.state.phase.attributes[name];
      newValue[this.props.locale] = value;
      this.setState({
        attributeDiff: { ...this.state.attributeDiff, [name]: newValue },
      });
    }
  }

  handleDescChange = (newState: EditorState) => {
    const htmlValue = draftjsToHtml(convertToRaw(newState.getCurrentContent()));
    if (this.state.phase) {
      const newValue = this.state.phase && this.state.phase.attributes.description_multiloc;
      newValue[this.props.locale] = htmlValue;
      this.setState({
        attributeDiff: { ...this.state.attributeDiff, description_multiloc: htmlValue },
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
    if (this.state.phase) {
      this.setState({ saving: true });
      updatePhase(this.state.phase.id, this.state.attributeDiff)
      .then(() => {
        this.setState({ saving: false });
      })
      .catch((errors) => {
        // TODO: Update state with errors from the API
      });
    }
  }

  render() {
    if (!this.state.phase) return null;
    const phaseAttrs = { ...this.state.phase.attributes, ...this.state.attributeDiff };

    return (
      <div>
        <h1>Edit phase</h1>

        <form onSubmit={this.handleOnSubmit}>
          <Label htmlFor="title"><FormattedMessage {...messages.titleLabel} /></Label>
          <Input
            id="title"
            type="text"
            value={this.props.tFunc(phaseAttrs.title_multiloc)}
            onChange={this.createMultilocUpdater('title_multiloc')}
          />
          <Error text={this.state.errors.title.join(', ')} />

          <Label><FormattedMessage {...messages.datesLabel} /></Label>
          <DateRangePicker
            startDate={moment(phaseAttrs.start_at)} // momentPropTypes.momentObj or null,
            endDate={moment(phaseAttrs.end_at)} // momentPropTypes.momentObj or null,
            onDatesChange={this.handleDateUpdate} // PropTypes.func.isRequired,
            focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
            onFocusChange={this.handleDateFocusChange} // PropTypes.func.isRequired,
            isOutsideRange={this.isOutsideRange}
            firstDayOfWeek={1}
            displayFormat="DD/MM/YYYY"
          />

          <Label htmlFor="description"><FormattedMessage {...messages.descriptionLabel} /></Label>
          <Editor
            id="description"
            placeholder=""
            value={this.state.descState}
            error=""
            onChange={this.handleDescChange}
          />
          <Error text={this.state.errors.description.join(', ')} />

          <Button loading={this.state.saving} ><FormattedMessage {...messages.saveLabel} /></Button>
        </form>
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
});

export default injectTFunc(injectIntl(connect(mapStateToProps)(AdminProjectTimelineEdit)));
