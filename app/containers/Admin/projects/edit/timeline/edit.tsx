// must be at the top, before other imports!
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import moment from 'moment';
import { get, isEmpty } from 'lodash';
import { EditorState } from 'draft-js';
// import { browserHistory } from 'react-router';

// Services
import { localeStream } from 'services/locale';
import { projectBySlugStream, IProject } from 'services/projects';
import { phaseStream, updatePhase, addPhase, IPhase, IUpdatedPhaseProperties } from 'services/phases';
import eventEmitter from 'utils/eventEmitter';

// Utils
import getSubmitState from 'utils/getSubmitState';
import { getEditorStateFromHtmlString, getHtmlStringFromEditorState } from 'utils/editorTools';

// Components
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Editor from 'components/UI/Editor';
import Error from 'components/UI/Error';
import { DateRangePicker } from 'react-dates';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import ParticipationContext, { IParticipationContextConfig } from '../parcticipationContext';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { injectTFunc } from 'components/T/utils';
import messages from './messages';

// Styling
import styled from 'styled-components';

// Typings
import { API, Locale } from 'typings';

const PhaseForm = styled.form`
  .DateRangePickerInput {
    border-radius: 5px;

    svg {
      z-index: 3;
    }

    .DateInput,
    .DateInput_input {
      color: #333;
      font-family: 'visuelt', sans-serif !important;
      font-size: 16px;
      font-weight: 400;
      background: transparent;
    }
  }

  .DateRangePicker_picker {
    z-index: 2;
  }
`;

interface IParams {
  slug: string | null;
  id: string | null;
}

type Props = {
  params: IParams,
  tFunc: Function,
  intl: ReactIntl.InjectedIntl;
};

interface State {
  locale: Locale;
  phase: IPhase | null;
  project: IProject | null;
  attributeDiff: IUpdatedPhaseProperties;
  errors: { [fieldName: string]: API.Error[] } | null;
  saving: boolean;
  focusedInput: 'startDate' | 'endDate' | null;
  editorState: EditorState;
  saved: boolean;
  loaded: boolean;
}

class AdminProjectTimelineEdit extends React.Component<Props, State> {
  params$: Rx.BehaviorSubject<IParams>;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      locale: null as any,
      phase: null,
      project: null,
      attributeDiff: {},
      errors: null,
      saving: false,
      focusedInput: null,
      editorState: EditorState.createEmpty(),
      saved: false,
      loaded: false
    };
    this.subscriptions = [];
    this.params$ = new Rx.BehaviorSubject({ slug: null, id: null });
  }

  componentWillMount() {
    const { slug, id } = this.props.params;
    this.params$ = new Rx.BehaviorSubject({ slug, id });

    this.subscriptions = [
      this.params$.distinctUntilChanged().switchMap((params) => {
        const { slug, id } = params;
        const locale$ = localeStream().observable;
        const project$ = (slug ? projectBySlugStream(slug).observable : Rx.Observable.of(null));
        const phase$ = (id ? phaseStream(id).observable : Rx.Observable.of(null));
        return Rx.Observable.combineLatest(locale$, project$, phase$);
      }).subscribe(([locale, project, phase]) => {
        this.setState({
          locale,
          project,
          phase,
          editorState: getEditorStateFromHtmlString(get(phase, `data.attributes.description_multiloc.${locale}`, '')),
          loaded: true
        });
      })
    ];
  }

  componentWillReceiveProps(nextProps: Props) {
    const { slug, id } = nextProps.params;
    this.params$ = new Rx.BehaviorSubject({ slug, id });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  createMultilocUpdater = (name: string) => (value: string) => {
    const { locale, attributeDiff } = this.state;

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

  handleEditorOnChange = (editorState: EditorState) => {
    const { locale, attributeDiff } = this.state;

    if (attributeDiff) {
      const newHtmlValue = getHtmlStringFromEditorState(editorState);

      this.setState({
        editorState,
        attributeDiff: {
          ...attributeDiff,
          description_multiloc: {
            ...get(this.state, 'phase.data.attributes.description_multiloc', {}),
            ...get(attributeDiff, 'description_multiloc', {}),
            [locale]: newHtmlValue
          }
        }
      });
    }
  }

  handleDateUpdate = ({ startDate, endDate }) => {
    const { attributeDiff } = this.state;
    const newAttributesDiff = attributeDiff;
    newAttributesDiff.start_at = startDate ? startDate.format('YYYY-MM-DD') : '';
    newAttributesDiff.end_at = endDate ? endDate.format('YYYY-MM-DD') : '';
    this.setState({ attributeDiff: newAttributesDiff });
  }

  handleDateFocusChange = (focusedInput: 'startDate' | 'endDate') => {
    this.setState({ focusedInput });
  }

  isOutsideRange = () => {
    return false;
  }

  handleOnSubmit = async (event: React.FormEvent<any>) => {
    event.preventDefault();
    eventEmitter.emit('AdminProjectTimelineEdit', 'getParticipationContext', null);
  }

  handleParticipationContextOnChange = (participationContextConfig: IParticipationContextConfig) => {
    const { attributeDiff } = this.state;
    const { participationMethod, postingEnabled, commentingEnabled, votingEnabled, votingMethod, votingLimit } = participationContextConfig;

    this.setState({
      attributeDiff: {
        ...attributeDiff,
        participation_method: participationMethod,
        posting_enabled: postingEnabled,
        commenting_enabled: commentingEnabled,
        voting_enabled: votingEnabled,
        voting_method: votingMethod,
        voting_limited_max: votingLimit
      }
    });
  }

  handleParcticipationContextOnSubmit = (participationContextConfig: IParticipationContextConfig) => {
    let { attributeDiff } = this.state;
    const { phase, project } = this.state;
    const { slug } = this.props.params;
    const { participationMethod, postingEnabled, commentingEnabled, votingEnabled, votingMethod, votingLimit } = participationContextConfig;

    attributeDiff = {
      ...attributeDiff,
      participation_method: participationMethod,
      posting_enabled: postingEnabled,
      commenting_enabled: commentingEnabled,
      voting_enabled: votingEnabled,
      voting_method: votingMethod,
      voting_limited_max: votingLimit
    };

    this.save(slug, project, phase, attributeDiff);
  }

  save = async (slug: string | null, project: IProject | null, phase: IPhase | null, attributeDiff: IUpdatedPhaseProperties) => {
    if (!isEmpty(attributeDiff)) {
      try {
        if (phase) {
          const savedPhase = await updatePhase(phase.data.id, attributeDiff);
          this.setState({ saving: false, saved: true, attributeDiff: {}, phase: savedPhase, errors: null });
        } else if (project && slug) {
          const savedPhase = await addPhase(project.data.id, attributeDiff);
          // browserHistory.push(`/admin/projects/${slug}/timeline/`);
          this.setState({ saving: false, saved: true, attributeDiff: {}, phase: savedPhase, errors: null });
        }
      } catch (errors) {
        this.setState({
          errors: get(errors, 'json.errors', null), 
          saving: false, 
          saved: false
        });
      }
    }
  }

  render() {
    if (this.state.loaded) {
      const { tFunc } = this.props;
      const { formatMessage } = this.props.intl;
      const { errors, saved, phase, attributeDiff, saving, editorState } = this.state;
      const phaseAttrs = (phase ? { ...phase.data.attributes, ...attributeDiff } : { ...attributeDiff });
      const submitState = getSubmitState({ errors, saved, diff: attributeDiff });
      const startDate = (phaseAttrs.start_at ? moment(phaseAttrs.start_at) : null);
      const endDate = (phaseAttrs.end_at ? moment(phaseAttrs.end_at) : null);

      return (
        <>
          <SectionTitle>
            {phase && <FormattedMessage {...messages.editPhaseTitle} />}
            {!phase && <FormattedMessage {...messages.newPhaseTitle} />}
          </SectionTitle>

          <PhaseForm onSubmit={this.handleOnSubmit}>
            <Section>
              <SectionField>
                <Label htmlFor="title"><FormattedMessage {...messages.titleLabel} /></Label>
                <Input
                  id="title"
                  type="text"
                  value={tFunc(phaseAttrs.title_multiloc)}
                  onChange={this.createMultilocUpdater('title_multiloc')}
                />
                <Error apiErrors={errors && errors.title_multiloc} />
              </SectionField>

              <SectionField>
                <ParticipationContext 
                  phaseId={(phase ? phase.data.id : null)}
                  onSubmit={this.handleParcticipationContextOnSubmit}
                  onChange={this.handleParticipationContextOnChange}
                />
              </SectionField>

              <SectionField>
                <Label><FormattedMessage {...messages.datesLabel} /></Label>
                <DateRangePicker
                  startDateId={'startDate'}
                  endDateId={'endDate'}
                  startDate={startDate}
                  endDate={endDate}
                  onDatesChange={this.handleDateUpdate}
                  focusedInput={this.state.focusedInput}
                  onFocusChange={this.handleDateFocusChange}
                  isOutsideRange={this.isOutsideRange}
                  firstDayOfWeek={1}
                  displayFormat="DD/MM/YYYY"
                  startDatePlaceholderText={formatMessage(messages.startDatePlaceholder)}
                  endDatePlaceholderText={formatMessage(messages.endDatePlaceholder)}
                />
                <Error apiErrors={errors && errors.start_at} />
                <Error apiErrors={errors && errors.end_at} />
              </SectionField>

              <SectionField>
                <Label htmlFor="description"><FormattedMessage {...messages.descriptionLabel} /></Label>
                <Editor
                  id="description"
                  placeholder=""
                  value={editorState}
                  error=""
                  onChange={this.handleEditorOnChange}
                />
                <Error apiErrors={errors && errors.description_multiloc} />
              </SectionField>
            </Section>

            <SubmitWrapper
              loading={saving}
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
        </>
      );
    }

    return null;
  }
}

export default injectTFunc(injectIntl(AdminProjectTimelineEdit));
