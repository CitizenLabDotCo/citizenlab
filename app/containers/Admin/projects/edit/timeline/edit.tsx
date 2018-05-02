// must be at the top, before other imports!
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import { get, isEmpty, forOwn } from 'lodash';

// Services
import { localeStream } from 'services/locale';
import { projectByIdStream, IProject } from 'services/projects';
import { phaseStream, updatePhase, addPhase, IPhase, IUpdatedPhaseProperties } from 'services/phases';
import eventEmitter from 'utils/eventEmitter';

// Utils
import getSubmitState from 'utils/getSubmitState';
import { getEditorStateFromHtmlString, getHtmlStringFromEditorState } from 'utils/editorTools';
import shallowCompare from 'utils/shallowCompare';

// Components
import Label from 'components/UI/Label';
import InputMultiloc from 'components/UI/InputMultiloc';
import EditorMultiloc from 'components/UI/EditorMultiloc';
import Error from 'components/UI/Error';
// import Radio from 'components/UI/Radio';
import { DateRangePicker } from 'react-dates';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import ParticipationContext, { IParticipationContextConfig } from '../participationContext';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { injectTFunc } from 'components/T/utils';
import messages from './messages';
// import projectSettingsMessages from '../../messages';

// Styling
import styled from 'styled-components';

// Typings
import { API, Locale, MultilocEditorState } from 'typings';

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
  projectId: string | null;
  id: string | null;
}

type Props = {
  params: IParams,
  tFunc: Function,
};

interface State {
  locale: Locale;
  phase: IPhase | null;
  project: IProject | null;
  presentationMode: 'map' | 'card';
  attributeDiff: IUpdatedPhaseProperties;
  errors: { [fieldName: string]: API.Error[] } | null;
  saving: boolean;
  focusedInput: 'startDate' | 'endDate' | null;
  multilocEditorState: MultilocEditorState | null;
  saved: boolean;
  loaded: boolean;
}

class AdminProjectTimelineEdit extends React.Component<Props & InjectedIntlProps, State> {
  params$: Rx.BehaviorSubject<IParams | null>;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      locale: null as any,
      phase: null,
      project: null,
      presentationMode: 'card',
      attributeDiff: {},
      errors: null,
      saving: false,
      focusedInput: null,
      multilocEditorState: null,
      saved: false,
      loaded: false
    };
    this.subscriptions = [];
    this.params$ = new Rx.BehaviorSubject(null);
  }

  componentDidMount() {
    const { projectId, id } = this.props.params;

    this.params$.next({ projectId, id });

    this.subscriptions = [
      this.params$
      .distinctUntilChanged(shallowCompare)
      .switchMap((params: IParams) => {
        const { projectId, id } = params;
        const locale$ = localeStream().observable;
        const project$ = (projectId ? projectByIdStream(projectId).observable : Rx.Observable.of(null));
        const phase$ = (id ? phaseStream(id).observable : Rx.Observable.of(null));
        return Rx.Observable.combineLatest(locale$, project$, phase$);
      }).subscribe(([locale, project, phase]) => {
        let multilocEditorState: MultilocEditorState | null = null;

        if (phase) {
          multilocEditorState = {};

          forOwn(phase.data.attributes.description_multiloc, (htmlValue, locale) => {
            (multilocEditorState as MultilocEditorState)[locale] = getEditorStateFromHtmlString(htmlValue);
          });
        }

        this.setState({
          locale,
          project,
          phase,
          multilocEditorState,
          loaded: true
        });
      })
    ];
  }

  componentDidUpdate() {
    const { projectId, id } = this.props.params;
    this.params$.next({ projectId, id });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleTitleMultilocOnChange = (titleMultiloc) => {
    this.setState((state) => ({
      attributeDiff: {
        ...state.attributeDiff,
        title_multiloc: titleMultiloc
      }
    }));
  }

  handleEditorOnChange = (multilocEditorState: MultilocEditorState, locale: Locale) => {
    this.setState((state) => ({
      multilocEditorState,
      attributeDiff: {
        ...state.attributeDiff,
        description_multiloc: {
          ...get(state, 'phase.data.attributes.description_multiloc', {}),
          ...get(state.attributeDiff, 'description_multiloc', {}),
          [locale]: getHtmlStringFromEditorState(multilocEditorState[locale])
        }
      }
    }));
  }

  handleIdeasDisplayChange = (presentationMode: 'map' | 'card') => {
    this.setState((state) => ({
      presentationMode,
      attributeDiff: {
        ...state.attributeDiff,
        presentation_mode: presentationMode
      }
    }));
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
    const { participationMethod, postingEnabled, commentingEnabled, votingEnabled, votingMethod, votingLimit, survey_embed_url, survey_service } = participationContextConfig;

    this.setState({
      attributeDiff: {
        ...attributeDiff,
        survey_embed_url,
        survey_service,
        participation_method: participationMethod,
        posting_enabled: postingEnabled,
        commenting_enabled: commentingEnabled,
        voting_enabled: votingEnabled,
        voting_method: votingMethod,
        voting_limited_max: votingLimit,
      }
    });
  }

  handleParcticipationContextOnSubmit = (participationContextConfig: IParticipationContextConfig) => {
    let { attributeDiff } = this.state;
    const { phase, project } = this.state;
    const { projectId } = this.props.params;
    const { participationMethod, postingEnabled, commentingEnabled, votingEnabled, votingMethod, votingLimit, survey_embed_url, survey_service } = participationContextConfig;

    attributeDiff = {
      ...attributeDiff,
      survey_embed_url,
      survey_service,
      participation_method: participationMethod,
      posting_enabled: postingEnabled,
      commenting_enabled: commentingEnabled,
      voting_enabled: votingEnabled,
      voting_method: votingMethod,
      voting_limited_max: votingLimit,
    };

    this.save(projectId, project, phase, attributeDiff);
  }

  save = async (projectId: string | null, project: IProject | null, phase: IPhase | null, attributeDiff: IUpdatedPhaseProperties) => {
    if (!isEmpty(attributeDiff)) {
      try {
        if (phase) {
          const savedPhase = await updatePhase(phase.data.id, attributeDiff);
          this.setState({ saving: false, saved: true, attributeDiff: {}, phase: savedPhase, errors: null });
        } else if (project && projectId) {
          const savedPhase = await addPhase(project.data.id, attributeDiff);
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
      const { formatMessage } = this.props.intl;
      const { errors, saved, phase, /* presentationMode, */ attributeDiff, saving, multilocEditorState } = this.state;
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
                <InputMultiloc
                  id="title"
                  label={<FormattedMessage {...messages.titleLabel} />}
                  type="text"
                  valueMultiloc={phaseAttrs.title_multiloc}
                  onChange={this.handleTitleMultilocOnChange}
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

              {/* <SectionField>
                <Label>
                  <FormattedMessage {...projectSettingsMessages.defaultDisplay} />
                </Label>
                {['card', 'map'].map((key) => (
                  <Radio
                    key={key}
                    onChange={this.handleIdeasDisplayChange}
                    currentValue={presentationMode}
                    value={key}
                    name="presentation_mode"
                    id={`presentation_mode-${key}`}
                    label={<FormattedMessage {...projectSettingsMessages[`${key}Display`]} />}
                  />
                ))}
              </SectionField> */}

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
                <EditorMultiloc
                  id="description"
                  label={<FormattedMessage {...messages.descriptionLabel} />}
                  valueMultiloc={multilocEditorState}
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
