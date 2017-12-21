// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { IStream } from 'utils/streams';
import * as moment from 'moment';
import { EditorState, ContentState, convertToRaw, convertFromHTML } from 'draft-js';
import { browserHistory } from 'react-router';
import { API } from 'typings';

// Services
import { projectBySlugStream, IProject, IProjectData } from 'services/projects';
import { phaseStream, updatePhase, addPhase, IPhase, IPhaseData, IUpdatedPhaseProperties } from 'services/phases';

// Utils
import getSubmitState from 'utils/getSubmitState';
import { getHtmlStringFromEditorState } from 'utils/editorTools';

// Components
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import TextArea from 'components/UI/TextArea';
import Editor from 'components/UI/Editor';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';

// i18n
import localize, { injectedLocalized } from 'utils/localize';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { injectTFunc } from 'components/T/utils';
import messages from './messages';

// Styling
import styled from 'styled-components';

const PhaseForm = styled.form`
  .DateRangePicker__picker {
    z-index: 2;
  }

  .DateRangePickerInput {
    border-radius: 5px;
    overflow: hidden;
  }
`;


// Component typing
type Props = {
  params: {
    id: string | null,
    slug: string | null,
  },
  tFunc: Function,
  project: IProjectData | null;
  intl: ReactIntl.InjectedIntl;
};

interface State {
  phase: IPhaseData | null;
  attributeDiff: IUpdatedPhaseProperties;
  errors: {
    [fieldName: string]: API.Error[]
  } | null;
  saving: boolean;
  focusedInput: 'START_DATE' | 'END_DATE' | null;
  descState: EditorState;
  saved: boolean;
}

class AdminProjectTimelineEdit extends React.Component<Props & injectedLocalized, State> {
  phase$: IStream<IPhase>;
  subscriptions: Rx.Subscription[];
  startDatePlaceholder: string;
  endDatePlaceholder: string;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      phase: null,
      attributeDiff: {},
      errors: null,
      saving: false,
      focusedInput: null,
      descState: EditorState.createEmpty(),
      saved: false,
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    this.startDatePlaceholder = this.props.intl.formatMessage(messages.startDatePlaceholder);
    this.endDatePlaceholder = this.props.intl.formatMessage(messages.endDatePlaceholder);
  }

  componentDidMount() {
    if (this.props.params.id) {
      this.subscriptions = [
        phaseStream(this.props.params.id)
        .observable
        .subscribe((phase) => {
          let descState = EditorState.createEmpty();

          if (phase) {
            const blocksFromHtml = convertFromHTML(_.get(phase, `data.attributes.description_multiloc.${this.props.locale}`, ''));
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

  handleDescChange = (editorState: EditorState) => {
    const htmlValue = getHtmlStringFromEditorState(editorState);

    if (this.state.attributeDiff) {
      const newValue = this.state.attributeDiff && this.state.attributeDiff.description_multiloc || {};
      newValue[this.props.locale] = htmlValue;
      this.setState({
        attributeDiff: { ...this.state.attributeDiff, description_multiloc: newValue },
        descState: editorState,
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

  handleOnSubmit = (event): void => {
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

    savingPromise
    .then((response) => {
      this.setState({ saving: false, saved: true, attributeDiff: {}, phase: response.data, errors: null });
    })
    .catch((e) => {
      try {
        let errors = null;
        if (e && e.json && e.json.errors) {
          errors = e.json.errors;
        }

        this.setState({ errors, saving: false, saved: false });
      } catch (e) {
        this.setState({ saving: false, saved: false });
      }
    });
  }

  render() {
    const phaseAttrs = this.state.phase
    ? { ...this.state.phase.attributes, ...this.state.attributeDiff }
    : { ...this.state.attributeDiff };

    const { errors, saved } = this.state;
    const submitState = getSubmitState({ errors, saved, diff: this.state.attributeDiff });
    moment.locale(this.props.locale);

    return (
      <div>
        <SectionTitle>
          {this.state.phase && <FormattedMessage {...messages.editPhaseTitle} />}
          {!this.state.phase && <FormattedMessage {...messages.newPhaseTitle} />}

        </SectionTitle>

        <PhaseForm onSubmit={this.handleOnSubmit}>
          <Section>
            <SectionField>
              <Label htmlFor="title"><FormattedMessage {...messages.titleLabel} /></Label>
              <Input
                id="title"
                type="text"
                value={this.props.tFunc(phaseAttrs.title_multiloc)}
                onChange={this.createMultilocUpdater('title_multiloc')}
              />
              <Error apiErrors={this.state.errors && this.state.errors.title_multiloc} />
            </SectionField>

            <SectionField>
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
                startDatePlaceholderText={this.startDatePlaceholder}
                endDatePlaceholderText={this.endDatePlaceholder}
              />
              <Error apiErrors={this.state.errors && this.state.errors.start_at} />
              <Error apiErrors={this.state.errors && this.state.errors.end_at} />
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
              <Error apiErrors={this.state.errors && this.state.errors.description_multiloc} />
            </SectionField>
          </Section>

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
        </PhaseForm>
      </div>
    );
  }
}

export default injectTFunc(injectIntl(localize(AdminProjectTimelineEdit)));
