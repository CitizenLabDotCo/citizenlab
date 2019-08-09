// must be at the top, before other imports!
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

// Libraries
import React, { PureComponent, FormEvent } from 'react';
import { Subscription, BehaviorSubject, combineLatest, of } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import moment, { Moment } from 'moment';
import { get, isEmpty } from 'lodash-es';
import clHistory from 'utils/cl-router/history';

// Services
import { localeStream } from 'services/locale';
import { phaseFilesStream, addPhaseFile, deletePhaseFile } from 'services/phaseFiles';
import { phaseStream, updatePhase, addPhase, IPhase, IUpdatedPhaseProperties } from 'services/phases';
import eventEmitter from 'utils/eventEmitter';

// Utils
import shallowCompare from 'utils/shallowCompare';
import { convertUrlToUploadFileObservable } from 'utils/fileTools';

// Components
import Label from 'components/UI/Label';
import InputMultiloc from 'components/UI/InputMultiloc';
import QuillMultiloc from 'components/UI/QuillEditor/QuillMultiloc';
import Error from 'components/UI/Error';
import { DateRangePicker } from 'react-dates';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import ParticipationContext, { IParticipationContextConfig } from '../participationContext';
import FileUploader from 'components/UI/FileUploader';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// Typings
import { CLError, Locale, UploadFile, Multiloc } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

const PhaseForm = styled.form`
  .DateRangePickerInput {
    border-radius: ${(props: any) => props.theme.borderRadius};

    svg {
      z-index: 3;
    }

    .DateInput,
    .DateInput_input {
      color: inherit;
      font-size: ${fontSizes.base}px;
      font-weight: 400;
      background: transparent;
    }
  }

  .DateRangePicker_picker {
    z-index: 2;
  }

  .CalendarMonth_caption {
    color: inherit;
  }
`;

interface IParams {
  projectId: string | null;
  id: string | null;
}

interface DataProps {}

interface Props extends DataProps {
  params: IParams;
}

interface State {
  locale: Locale | null;
  phase: IPhase | null;
  presentationMode: 'map' | 'card';
  attributeDiff: IUpdatedPhaseProperties;
  errors: { [fieldName: string]: CLError[] } | null;
  saving: boolean;
  focusedInput: 'startDate' | 'endDate' | null;
  saved: boolean;
  loaded: boolean;
  phaseFiles: UploadFile[];
  phaseFilesToRemove: UploadFile[];
  submitState: 'disabled' | 'enabled' | 'error' | 'success';
}

class AdminProjectTimelineEdit extends PureComponent<Props & InjectedIntlProps, State> {
  params$: BehaviorSubject<IParams | null>;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      locale: null,
      phase: null,
      presentationMode: 'card',
      attributeDiff: {},
      errors: null,
      saving: false,
      focusedInput: null,
      saved: false,
      loaded: false,
      phaseFiles: [],
      phaseFilesToRemove: [],
      submitState: 'disabled'
    };
    this.subscriptions = [];
    this.params$ = new BehaviorSubject(null);
  }

  componentDidMount() {
    const { projectId, id } = this.props.params;

    this.params$.next({ projectId, id });

    this.subscriptions = [
      this.params$.pipe(
        distinctUntilChanged(shallowCompare),
        switchMap((params: IParams) => {
          const { id } = params;
          const locale$ = localeStream().observable;
          const phase$ = (id ? phaseStream(id).observable : of(null));
          return combineLatest(locale$, phase$);
        })
      ).subscribe(([locale, phase]) => {
        this.setState({
          locale,
          phase,
          loaded: true
        });
      }),

      this.params$.pipe(
        distinctUntilChanged(shallowCompare),
        switchMap((params: IParams) => {
          return (params.id ? phaseFilesStream(params.id).observable.pipe(
            switchMap((phaseFiles) => {
              if (phaseFiles && phaseFiles.data && phaseFiles.data.length > 0) {
                return combineLatest(
                  phaseFiles.data.map((phaseFile) => {
                    const url = phaseFile.attributes.file.url;
                    const filename = phaseFile.attributes.name;
                    const id = phaseFile.id;
                    return convertUrlToUploadFileObservable(url, id, filename);
                  })
                );
              }

              return of([]);
            })
          ) : of([]));
        })
      ).subscribe((phaseFiles) => {
        this.setState({
          phaseFiles: phaseFiles.filter(file => !isNilOrError(file)) as UploadFile[]
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

  handleTitleMultilocOnChange = (title_multiloc: Multiloc) => {
    this.setState(({ attributeDiff }) => ({
      submitState: 'enabled',
      attributeDiff: {
        ...attributeDiff,
        title_multiloc
      }
    }));
  }

  handleEditorOnChange = (description_multiloc: Multiloc) => {
    this.setState(({ attributeDiff }) => ({
      submitState: 'enabled',
      attributeDiff: {
        ...attributeDiff,
        description_multiloc
      }
    }));
  }

  handleIdeasDisplayChange = (presentationMode: 'map' | 'card') => {
    this.setState(({ attributeDiff }) => ({
      presentationMode,
      submitState: 'enabled',
      attributeDiff: {
        ...attributeDiff,
        presentation_mode: presentationMode
      }
    }));
  }

  handleDateUpdate = ({ startDate, endDate }: { startDate: Moment, endDate: Moment }) => {
    this.setState(({ attributeDiff }) => ({
      submitState: 'enabled',
      attributeDiff: {
        ...attributeDiff,
        start_at: startDate ? startDate.format('YYYY-MM-DD') : '',
        end_at: endDate ? endDate.format('YYYY-MM-DD') : ''
      }
    }));
  }

  handleDateFocusChange = (focusedInput: 'startDate' | 'endDate') => {
    this.setState({ focusedInput });
  }

  isOutsideRange = () => {
    return false;
  }

  handlePhaseFileOnAdd = (newFile: UploadFile) => {
    this.setState((prevState) => {
      const isDuplicate = prevState.phaseFiles.some(file => file.base64 === newFile.base64);
      const phaseFiles = (isDuplicate ? prevState.phaseFiles : [...(prevState.phaseFiles || []), newFile]);
      const submitState = (isDuplicate ? prevState.submitState : 'enabled');

      return {
        phaseFiles,
        submitState
      };
    });
  }

  handlePhaseFileOnRemove = (fileToRemove: UploadFile) => {
    this.setState((prevState) => {
      const phaseFiles = prevState.phaseFiles.filter(file => file.base64 !== fileToRemove.base64);
      const phaseFilesToRemove = [...(prevState.phaseFilesToRemove || []), fileToRemove];

      return {
        phaseFiles,
        phaseFilesToRemove,
        submitState: 'enabled'
      };
    });
  }

  handleOnSubmit = async (event: FormEvent<any>) => {
    event.preventDefault();
    eventEmitter.emit('AdminProjectTimelineEdit', 'getParticipationContext', null);
  }

  getAttributeDiff = (participationContextConfig: IParticipationContextConfig) => {
    const attributeDiff: IUpdatedPhaseProperties = {
      ...this.state.attributeDiff,
      ...participationContextConfig
    };

    return attributeDiff;
  }

  handleParticipationContextOnChange = (participationContextConfig: IParticipationContextConfig) => {
    this.setState({
      submitState: 'enabled',
      attributeDiff: this.getAttributeDiff(participationContextConfig)
    });
  }

  handleParcticipationContextOnSubmit = (participationContextConfig: IParticipationContextConfig) => {
    const { phase } = this.state;
    const { projectId } = this.props.params;
    const attributeDiff = this.getAttributeDiff(participationContextConfig);
    this.save(projectId, phase, attributeDiff);
  }

  save = async (projectId: string | null, phase: IPhase | null, attributeDiff: IUpdatedPhaseProperties) => {
    if (!isEmpty(attributeDiff)) {
      try {
        const { phaseFiles, phaseFilesToRemove } = this.state;
        let phaseResponse = phase;
        let redirect = false;

        if (phase && !isEmpty(attributeDiff)) {
          phaseResponse = await updatePhase(phase.data.id, attributeDiff);
          this.setState({ attributeDiff: {} });
        } else if (projectId && !isEmpty(attributeDiff)) {
          phaseResponse = await addPhase(projectId, attributeDiff);
          redirect = true;
        }

        if (phaseResponse) {
          const phaseId = phaseResponse.data.id;
          const filesToAddPromises = phaseFiles.filter(file => !file.remote).map(file => addPhaseFile(phaseId, file.base64, file.name));
          const filesToRemovePromises = phaseFilesToRemove.filter(file => file.remote).map(file => deletePhaseFile(phaseId, file.id as string));

          await Promise.all([
            ...filesToAddPromises,
            ...filesToRemovePromises
          ] as Promise<any>[]);
        }

        this.setState({
          phaseFilesToRemove: [],
          saving: false,
          saved: true,
          errors: null,
          submitState: 'success'
        });

        if (redirect) {
          clHistory.push(`/admin/projects/${projectId}/timeline/`);
        }
      } catch (errors) {
        this.setState({
          errors: get(errors, 'json.errors', null),
          saving: false,
          saved: false,
          submitState: 'error'
        });
      }
    }
  }

  quillMultilocLabel = <FormattedMessage {...messages.descriptionLabel} />;

  render() {
    const { loaded } = this.state;

    if (loaded) {
      const { formatMessage } = this.props.intl;
      const { errors,  phase, attributeDiff, saving, phaseFiles, submitState } = this.state;
      const phaseAttrs = (phase ? { ...phase.data.attributes, ...attributeDiff } : { ...attributeDiff });
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
                  apiErrors={errors}
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

              <SectionField className="fullWidth">
                <QuillMultiloc
                  id="description"
                  inAdmin={true}
                  label={this.quillMultilocLabel}
                  valueMultiloc={phaseAttrs.description_multiloc}
                  onChangeMultiloc={this.handleEditorOnChange}
                />
                <Error apiErrors={errors && errors.description_multiloc} />
              </SectionField>

              <SectionField>
                <FileUploader
                  onFileAdd={this.handlePhaseFileOnAdd}
                  onFileRemove={this.handlePhaseFileOnRemove}
                  files={phaseFiles}
                  errors={errors}
                />
              </SectionField>

              {errors && errors.project &&
                <SectionField>
                  <Error apiErrors={errors.project} />
                </SectionField>
              }
              {errors && errors.base &&
                <SectionField>
                  <Error apiErrors={errors.base} />
                </SectionField>
              }
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

export default injectIntl<Props>(AdminProjectTimelineEdit);
