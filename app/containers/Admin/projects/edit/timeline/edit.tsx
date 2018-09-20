// must be at the top, before other imports!
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

// Libraries
import React from 'react';
import { Subscription, BehaviorSubject, combineLatest, of } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import moment from 'moment';
import { get, isEmpty, isString, some, filter } from 'lodash-es';
import clHistory from 'utils/cl-router/history';

// Services
import { localeStream } from 'services/locale';
import { phaseFilesStream, addPhaseFile, deletePhaseFile } from 'services/phaseFiles';
import { phaseStream, updatePhase, addPhase, IPhase, IUpdatedPhaseProperties } from 'services/phases';
import eventEmitter from 'utils/eventEmitter';

// Utils
import shallowCompare from 'utils/shallowCompare';
import { convertUrlToUploadFileWithBase64Observable } from 'utils/imageTools';

// Components
import Label from 'components/UI/Label';
import InputMultiloc from 'components/UI/InputMultiloc';
import QuillMultiloc from 'components/UI/QuillEditor/QuillMultiloc';
import Error from 'components/UI/Error';
import { DateRangePicker } from 'react-dates';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import ParticipationContext, { IParticipationContextConfig } from '../participationContext';
import FileInput from 'components/UI/FileInput';
import FileDisplay from 'components/UI/FileDisplay';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// Typings
import { CLError, Locale, UploadFile, Multiloc } from 'typings';

const PhaseForm = styled.form`
  .DateRangePickerInput {
    border-radius: 5px;

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
  locale: Locale;
  phase: IPhase | null;
  presentationMode: 'map' | 'card';
  attributeDiff: IUpdatedPhaseProperties;
  errors: { [fieldName: string]: CLError[] } | null;
  saving: boolean;
  focusedInput: 'startDate' | 'endDate' | null;
  saved: boolean;
  loaded: boolean;
  phaseFiles: UploadFile[] | null;
  phaseFilesToRemove: UploadFile[] | null;
  submitState: 'disabled' | 'enabled' | 'error' | 'success';
}

class AdminProjectTimelineEdit extends React.PureComponent<Props & InjectedIntlProps, State> {
  params$: BehaviorSubject<IParams | null>;
  subscriptions: Subscription[];

  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      locale: null as any,
      phase: null,
      presentationMode: 'card',
      attributeDiff: {},
      errors: null,
      saving: false,
      focusedInput: null,
      saved: false,
      loaded: false,
      phaseFiles: null,
      phaseFilesToRemove: null,
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
          const locale$ = localeStream().observable;
          const phase$ = (params.id ? phaseStream(params.id).observable : of(null));
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
                    return convertUrlToUploadFileWithBase64Observable(phaseFile.attributes.file.url).pipe(
                      map((phaseFileObject) => {
                        phaseFileObject['id'] = phaseFile.id;
                        phaseFileObject['filename'] = phaseFile.attributes.name;
                        phaseFileObject['url'] = phaseFile.attributes.file.url;
                        phaseFileObject['remote'] = true;
                        return phaseFileObject;
                      })
                    );
                  })
                );
              }

              return of(null);
            })
          ) : of(null));
        })
      ).subscribe((phaseFiles) => {
        this.setState({ phaseFiles });
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

  handleEditorOnChange = (description_multiloc) => {
    this.setState((state) => ({
      submitState: 'enabled',
      attributeDiff: {
        ...state.attributeDiff,
        description_multiloc,
      }
    }));
  }

  handleDateUpdate = ({ startDate, endDate }) => {
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
      const isDuplicate = some(prevState.phaseFiles, file => file.base64 === newFile.base64);
      const phaseFiles = (isDuplicate ? prevState.phaseFiles : [...(prevState.phaseFiles || []), newFile]);
      const submitState = (isDuplicate ? prevState.submitState : 'enabled');

      return {
        phaseFiles,
        submitState
      };
    });
  }

  handlePhaseFileOnRemove = (fileToRemove: UploadFile) => () => {
    this.setState((prevState) => {
      const phaseFiles = filter(prevState.phaseFiles, file => file.base64 !== fileToRemove.base64);
      const phaseFilesToRemove = [...(prevState.phaseFilesToRemove || []), fileToRemove];

      return {
        phaseFiles,
        phaseFilesToRemove,
        submitState: 'enabled'
      };
    });
  }

  handleOnSubmit = async (event: React.FormEvent<any>) => {
    event.preventDefault();
    eventEmitter.emit('AdminProjectTimelineEdit', 'getParticipationContext', null);
  }

  handleParticipationContextOnChange = (participationContextConfig: IParticipationContextConfig) => {
    const { attributeDiff } = this.state;
    const { participationMethod, postingEnabled, commentingEnabled, votingEnabled, votingMethod, votingLimit, presentationMode, survey_embed_url, survey_service } = participationContextConfig;

    this.setState({
      submitState: 'enabled',
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
        presentation_mode: presentationMode,
      }
    });
  }

  handleParcticipationContextOnSubmit = (participationContextConfig: IParticipationContextConfig) => {
    let { attributeDiff } = this.state;
    const { phase } = this.state;
    const { projectId } = this.props.params;
    const { participationMethod, postingEnabled, commentingEnabled, votingEnabled, votingMethod, votingLimit, survey_embed_url, survey_service, presentationMode } = participationContextConfig;

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
      presentation_mode: presentationMode
    };

    this.save(projectId, phase, attributeDiff);
  }

  getFilesToAddPromises = (phaseId: string) => {
    const { phaseFiles } = this.state;
    let filesToAddPromises: Promise<any>[] = [];

    if (phaseId && phaseFiles && phaseFiles.length > 0) {
      filesToAddPromises = phaseFiles.filter((file) => {
        return isString(file.base64) && file['remote'] !== true;
      }).map((file) => {
        return addPhaseFile(phaseId, file.base64 as string, file.name);
      });
    }

    return filesToAddPromises;
  }

  getFilesToRemovePromises = (phaseId: string) => {
    const { phaseFilesToRemove } = this.state;
    let filesToRemovePromises: Promise<any>[] = [];

    if (phaseId && phaseFilesToRemove && phaseFilesToRemove.length > 0) {
      filesToRemovePromises = phaseFilesToRemove.filter((file) => {
        return file['remote'] === true;
      }).map((file) => {
        return deletePhaseFile(phaseId, file.id as string);
      });
    }

    return filesToRemovePromises;
  }

  save = async (projectId: string | null, phase: IPhase | null, attributeDiff: IUpdatedPhaseProperties) => {
    try {
      let phaseResponse = phase;
      let redirect = false;

      if (phase && !isEmpty(attributeDiff)) {
        phaseResponse = await updatePhase(phase.data.id, attributeDiff);
      } else if (projectId && !isEmpty(attributeDiff)) {
        phaseResponse = await addPhase(projectId, attributeDiff);
        redirect = true;
      }

      if (phaseResponse) {
        const filesToAddPromises = this.getFilesToAddPromises(phaseResponse.data.id);
        const filesToRemovePromises  = this.getFilesToRemovePromises(phaseResponse.data.id);
        await Promise.all([...filesToAddPromises, ...filesToRemovePromises]);
      }

      this.setState({
        attributeDiff: {},
        phaseFilesToRemove: null,
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
        submitState: 'error',
      });
    }
  }

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
                  inAdmin
                  label={<FormattedMessage {...messages.descriptionLabel} />}
                  valueMultiloc={phaseAttrs.description_multiloc}
                  onChangeMultiloc={this.handleEditorOnChange}
                />
                <Error apiErrors={errors && errors.description_multiloc} />
              </SectionField>

              <SectionField>
                <Label>
                  <FormattedMessage {...messages.fileUploadLabel} />
                </Label>
                <FileInput
                  onAdd={this.handlePhaseFileOnAdd}
                />
                {Array.isArray(phaseFiles) && phaseFiles.map(file => (
                  <FileDisplay
                    key={file.id || file.filename}
                    onDeleteClick={this.handlePhaseFileOnRemove(file)}
                    file={file}
                  />)
                )}
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
