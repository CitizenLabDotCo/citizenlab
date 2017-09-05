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
import { browserHistory } from 'react-router';
import { API } from 'typings.d';

// Services
import { projectStream, IProject, IProjectData } from 'services/projects';
import { phaseStream, updatePhase, addPhase, IPhase, IPhaseData, IUpdatedPhaseProperties } from 'services/phases';
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
import SubmitWrapper from 'components/admin/SubmitWrapper';


// Component typing
type Props = {
  params: {
    id: string | null,
    slug: string | null,
  },
  locale: string,
  tFunc: Function,
  project: IProjectData | null;
};

interface State {
  phase: IPhaseData | null;
  attributeDiff: IUpdatedPhaseProperties;
  errors: {
    [fieldName: string]: API.Error[]
  };
  saving: boolean;
  focusedInput: 'START_DATE' | 'END_DATE' | null;
  descState: EditorState;
  saved: boolean;
}

class AdminProjectTimelineEdit extends React.Component<Props, State> {
  phase$: IStream<IPhase>;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      phase: null,
      attributeDiff: {},
      errors: {},
      saving: false,
      focusedInput: null,
      descState: EditorState.createEmpty(),
      saved: false,
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
        phaseStream(this.props.params.id)
        .observable
        .subscribe((phase) => {
          let descState = EditorState.createEmpty();

          if (phase) {
            const blocksFromHtml = convertFromHTML(phase.data.attributes.description_multiloc[this.props.locale]);
            const editorContent = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);
            descState = EditorState.createWithContent(editorContent);
          }

          this.setState({
            descState,
            phase: phase ? phase.data : null,
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

    let savingPromise;

    if (this.state.phase) {
      savingPromise = updatePhase(this.state.phase.id, this.state.attributeDiff);
    } else if (this.props.project) {
      savingPromise = addPhase(this.props.project.id, this.state.attributeDiff).then((response) => {
        browserHistory.push(`/admin/projects/${this.props.params.slug}/timeline/${response.data.id}`);
        return response;
      });
    }

    this.setState({ saving: true, saved: false });

    savingPromise.catch((e) => {
      this.setState({ saving: false, errors: e.json.errors });
    }).then((response) => {
      this.setState({ saving: false, saved: true, attributeDiff: {}, phase: response.data });
    });
  }

  render() {
    const phaseAttrs = this.state.phase
    ?  { ...this.state.phase.attributes, ...this.state.attributeDiff }
    : { ...this.state.attributeDiff };

    const submitState = this.getSubmitState();

    return (
      <div>
        <h1>
          {this.state.phase && <FormattedMessage {...messages.editPhaseTitle} />}
          {!this.state.phase && <FormattedMessage {...messages.newPhaseTitle} />}

        </h1>

        <form onSubmit={this.handleOnSubmit}>
          <FieldWrapper>
            <Label htmlFor="title"><FormattedMessage {...messages.titleLabel} /></Label>
            <Input
              id="title"
              type="text"
              value={this.props.tFunc(phaseAttrs.title_multiloc)}
              onChange={this.createMultilocUpdater('title_multiloc')}
            />
            <Error apiErrors={this.state.errors.title_multiloc} />
          </FieldWrapper>

          <FieldWrapper>
            <Label><FormattedMessage {...messages.datesLabel} /></Label>
            <DateRangePicker
              startDate={phaseAttrs.start_at ? moment(phaseAttrs.start_at) : null} // momentPropTypes.momentObj or null,
              endDate={phaseAttrs.end_at ? moment(phaseAttrs.end_at) : null} // momentPropTypes.momentObj or null,
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
            <Error apiErrors={this.state.errors.description_multiloc} />
          </FieldWrapper>

          <SubmitWrapper
            loading={this.state.saving}
            status={submitState}
            messages={{
              buttonSave: messages.saveLabel,
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

export default injectTFunc(injectIntl(connect(mapStateToProps)(AdminProjectTimelineEdit)));
