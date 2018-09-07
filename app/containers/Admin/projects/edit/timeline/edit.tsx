// must be at the top, before other imports!
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

// Libraries
import React from 'react';
import { Subscription, BehaviorSubject, combineLatest, of } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import moment from 'moment';
import { get, isEmpty, isString } from 'lodash-es';

// Services
import { localeStream } from 'services/locale';
import { projectByIdStream, IProject } from 'services/projects';
import { phaseFilesStream, addPhaseFile, deletePhaseFile } from 'services/phaseFiles';
import { phaseStream, updatePhase, addPhase, IPhase, IUpdatedPhaseProperties } from 'services/phases';
import eventEmitter from 'utils/eventEmitter';

// Utils
import shallowCompare from 'utils/shallowCompare';
import { convertUrlToUploadFileObservable } from 'utils/imageTools';

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
import { CLError, Locale, UploadFile } from 'typings';

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
  project: IProject | null;
  presentationMode: 'map' | 'card';
  attributeDiff: IUpdatedPhaseProperties;
  errors: { [fieldName: string]: CLError[] } | null;
  saving: boolean;
  focusedInput: 'startDate' | 'endDate' | null;
  saved: boolean;
  loaded: boolean;
  remotePhaseFiles: UploadFile[] | null;
  localPhaseFiles: UploadFile[] | null;
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
      project: null,
      presentationMode: 'card',
      attributeDiff: {},
      errors: null,
      saving: false,
      focusedInput: null,
      saved: false,
      loaded: false,
      remotePhaseFiles: null,
      localPhaseFiles: null,
      submitState: 'disabled',
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
          const { projectId, id } = params;
          const locale$ = localeStream().observable;
          const project$ = (projectId ? projectByIdStream(projectId).observable : of(null));
          const phaseFiles$ = (id ? phaseFilesStream(id).observable.pipe(
            switchMap((phaseFiles) => {
              if (phaseFiles && phaseFiles.data && phaseFiles.data.length > 0) {
                return combineLatest(
                  phaseFiles.data.map((phaseFile) => {
                    return convertUrlToUploadFileObservable(phaseFile.attributes.file.url).pipe(map((phaseFileObject) => {
                      phaseFileObject['id'] = phaseFile.id;
                      phaseFileObject['filename'] = phaseFile.attributes.name;
                      phaseFileObject['url'] = phaseFile.attributes.file.url;
                      return phaseFileObject;
                    }));
                  })
                );
              }

              return of(null);
            })
          ) : of(null));
          const phase$ = (id ? phaseStream(id).observable : of(null));
          return combineLatest(locale$, project$, phaseFiles$, phase$);
        })
      ).subscribe(([locale, project, phaseFiles, phase]) => {
        this.setState({
          locale,
          project,
          phase,
          remotePhaseFiles: phaseFiles,
          localPhaseFiles: phaseFiles,
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

  handleTitleMultilocOnChange = (title_multiloc) => {
    this.setState((state) => ({
      submitState: 'enabled',
      attributeDiff: {
        ...state.attributeDiff,
        title_multiloc,
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
    const { attributeDiff } = this.state;
    const newAttributesDiff = attributeDiff;
    newAttributesDiff.start_at = startDate ? startDate.format('YYYY-MM-DD') : '';
    newAttributesDiff.end_at = endDate ? endDate.format('YYYY-MM-DD') : '';
    this.setState({
      submitState: 'enabled',
      attributeDiff: newAttributesDiff
    });
  }

  handleDateFocusChange = (focusedInput: 'startDate' | 'endDate') => {
    this.setState({ focusedInput });
  }

  isOutsideRange = () => {
    return false;
  }

  handlePhaseFileOnAdd = (newFile: UploadFile) => {
    this.setState((prevState) => ({
      submitState: 'enabled',
      localPhaseFiles: [
        ...(prevState.localPhaseFiles || []),
        newFile
      ]
    }));
  }

  handlePhaseFileOnRemove = (removedFile: UploadFile) => () => {
    this.setState((prevState) => {
      let localPhaseFiles: UploadFile[] | null = null;

      if (Array.isArray(prevState.localPhaseFiles)) {
        localPhaseFiles = prevState.localPhaseFiles.filter(phaseFile => phaseFile.filename !== removedFile.filename);
      }

      return {
        localPhaseFiles,
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
    const { phase, project } = this.state;
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

    this.save(projectId, project, phase, attributeDiff);
  }

  getFilesToAddPromises = () => {
    const { remotePhaseFiles, localPhaseFiles } = this.state;
    const { id } = this.props.params;
    let filesToAdd = localPhaseFiles;
    let filesToAddPromises: Promise<any>[] = [];

    if (localPhaseFiles && Array.isArray(remotePhaseFiles)) {
      // localPhaseFiles = local state of files
      // This means those previously uploaded + files that have been added/removed
      // remotePhaseFiles = last saved state of files (remote)

      filesToAdd = localPhaseFiles.filter((localPhaseFile) => {
        return !remotePhaseFiles.some(remotePhaseFile => remotePhaseFile.filename === localPhaseFile.filename);
      });
    }

    if (id && filesToAdd && filesToAdd.length > 0) {
      filesToAddPromises = filesToAdd.filter((fileToAdd) => {
        return isString(fileToAdd.base64);
      }).map((fileToAdd) => {
        return addPhaseFile(id, fileToAdd.base64 as string, fileToAdd.name);
      });
    }

    return filesToAddPromises;
  }

  getFilesToRemovePromises = () => {
    const { remotePhaseFiles, localPhaseFiles } = this.state;
    const { id } = this.props.params;
    let filesToRemove: UploadFile[] | null = remotePhaseFiles;
    let filesToRemovePromises: Promise<any>[] = [];

    if (localPhaseFiles && Array.isArray(remotePhaseFiles)) {
      // localPhaseFiles = local state of files
      // This means those previously uploaded + files that have been added/removed
      // remotePhaseFiles = last saved state of files (remote)

      filesToRemove = remotePhaseFiles.filter((remotePhaseFile) => {
        return !localPhaseFiles.some(localPhaseFile => localPhaseFile.filename === remotePhaseFile.filename);
      });
    }

    if (id && filesToRemove && filesToRemove.length > 0) {
      filesToRemovePromises = filesToRemove.filter((fileToRemove) => {
        return isString(fileToRemove.id);
      }).map((fileToRemove) => {
        return deletePhaseFile(id, fileToRemove.id as string);
      });
    }

    return filesToRemovePromises;
  }

  save = async (projectId: string | null, project: IProject | null, phase: IPhase | null, attributeDiff: IUpdatedPhaseProperties) => {
    const filesToAddPromises: Promise<any>[] = this.getFilesToAddPromises();
    const filesToRemovePromises: Promise<any>[]  = this.getFilesToRemovePromises();

    try {
      if (!isEmpty(attributeDiff)) {
        if (phase) {
          const savedPhase = await updatePhase(phase.data.id, attributeDiff);
          this.setState({ saving: false, saved: true, attributeDiff: {}, phase: savedPhase, errors: null, submitState: 'success' });
        } else if (project && projectId) {
          const savedPhase = await addPhase(project.data.id, attributeDiff);
          this.setState({ saving: false, saved: true, attributeDiff: {}, phase: savedPhase, errors: null, submitState: 'success' });
        }
      }

      if (filesToAddPromises.length > 0 || filesToRemovePromises.length > 0) {
        await Promise.all([
          ...filesToAddPromises,
          ...filesToRemovePromises
        ]);
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
    if (this.state.loaded) {
      const { formatMessage } = this.props.intl;
      const { errors,  phase, attributeDiff, saving, localPhaseFiles, submitState } = this.state;
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
                {Array.isArray(localPhaseFiles) && localPhaseFiles.map(file => (
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
