// Libraries
import { get, isEmpty } from 'lodash-es';
import moment, { Moment } from 'moment';
import React, { FormEvent, PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { BehaviorSubject, combineLatest, of, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// Services
import { localeStream } from 'services/locale';
import {
  addPhaseFile,
  deletePhaseFile,
  phaseFilesStream,
} from 'services/phaseFiles';
import {
  addPhase,
  IPhase,
  IUpdatedPhaseProperties,
  phaseStream,
  updatePhase,
} from 'services/phases';
import eventEmitter from 'utils/eventEmitter';

// Utils
import { convertUrlToUploadFileObservable } from 'utils/fileUtils';
import shallowCompare from 'utils/shallowCompare';

// Components
import { Label } from '@citizenlab/cl2-component-library';
import DateRangePicker from 'components/admin/DateRangePicker';
import { Section, SectionField, SectionTitle } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Error from 'components/UI/Error';
import FileUploader from 'components/UI/FileUploader';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import ParticipationContext, {
  IParticipationContextConfig,
} from '../participationContext';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';

// Typings
import { CLError, Locale, Multiloc, UploadFile } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

// Resources
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';

const PhaseForm = styled.form``;

interface IParams {
  projectId: string | null;
  id: string | null;
}

interface DataProps {
  phases: GetPhasesChildProps;
}

interface InputProps {}

interface Props extends DataProps, InputProps {}

interface State {
  locale: Locale | null;
  phase: IPhase | null;
  presentationMode: 'map' | 'card';
  attributeDiff: IUpdatedPhaseProperties;
  errors: { [fieldName: string]: CLError[] } | null;
  processing: boolean;
  saved: boolean;
  loaded: boolean;
  phaseFiles: UploadFile[];
  phaseFilesToRemove: UploadFile[];
  submitState: 'disabled' | 'enabled' | 'error' | 'success';
}

class AdminProjectTimelineEdit extends PureComponent<
  Props & WrappedComponentProps & WithRouterProps,
  State
> {
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
      processing: false,
      saved: false,
      loaded: false,
      phaseFiles: [],
      phaseFilesToRemove: [],
      submitState: 'disabled',
    };
    this.subscriptions = [];
    this.params$ = new BehaviorSubject(null);
  }

  componentDidMount() {
    const { projectId, id } = this.props.params;

    this.params$.next({ projectId, id });

    this.subscriptions = [
      this.params$
        .pipe(
          distinctUntilChanged(shallowCompare),
          switchMap((params: IParams) => {
            const { id } = params;
            const locale$ = localeStream().observable;
            const phase$ = id ? phaseStream(id).observable : of(null);
            return combineLatest([locale$, phase$]);
          })
        )
        .subscribe(([locale, phase]) => {
          this.setState({
            locale,
            phase,
            loaded: true,
          });
        }),

      this.params$
        .pipe(
          distinctUntilChanged(shallowCompare),
          switchMap((params: IParams) => {
            return params.id
              ? phaseFilesStream(params.id).observable.pipe(
                  switchMap((phaseFiles) => {
                    if (
                      phaseFiles &&
                      phaseFiles.data &&
                      phaseFiles.data.length > 0
                    ) {
                      return combineLatest(
                        phaseFiles.data.map((phaseFile) => {
                          const url = phaseFile.attributes.file.url;
                          const filename = phaseFile.attributes.name;
                          const id = phaseFile.id;
                          return convertUrlToUploadFileObservable(
                            url,
                            id,
                            filename
                          );
                        })
                      );
                    }

                    return of([]);
                  })
                )
              : of([]);
          })
        )
        .subscribe((phaseFiles) => {
          this.setState({
            phaseFiles: phaseFiles.filter(
              (file) => !isNilOrError(file)
            ) as UploadFile[],
          });
        }),
    ];
  }

  componentDidUpdate() {
    const { projectId, id } = this.props.params;
    this.params$.next({ projectId, id });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  handleTitleMultilocOnChange = (title_multiloc: Multiloc) => {
    this.setState(({ attributeDiff }) => ({
      submitState: 'enabled',
      attributeDiff: {
        ...attributeDiff,
        title_multiloc,
      },
    }));
  };

  handleEditorOnChange = (description_multiloc: Multiloc) => {
    this.setState(({ attributeDiff }) => ({
      submitState: 'enabled',
      attributeDiff: {
        ...attributeDiff,
        description_multiloc,
      },
    }));
  };

  handleIdeasDisplayChange = (presentationMode: 'map' | 'card') => {
    this.setState(({ attributeDiff }) => ({
      presentationMode,
      submitState: 'enabled',
      attributeDiff: {
        ...attributeDiff,
        presentation_mode: presentationMode,
      },
    }));
  };

  handleDateUpdate = ({
    startDate,
    endDate,
  }: {
    startDate: Moment;
    endDate: Moment;
  }) => {
    this.setState(({ attributeDiff }) => ({
      submitState: 'enabled',
      attributeDiff: {
        ...attributeDiff,
        start_at: startDate ? startDate.locale('en').format('YYYY-MM-DD') : '',
        end_at: endDate ? endDate.locale('en').format('YYYY-MM-DD') : '',
      },
    }));
  };

  handlePhaseFileOnAdd = (newFile: UploadFile) => {
    this.setState((prevState) => {
      const isDuplicate = prevState.phaseFiles.some(
        (file) => file.base64 === newFile.base64
      );
      const phaseFiles = isDuplicate
        ? prevState.phaseFiles
        : [...(prevState.phaseFiles || []), newFile];
      const submitState = isDuplicate ? prevState.submitState : 'enabled';

      return {
        phaseFiles,
        submitState,
      };
    });
  };

  handlePhaseFileOnRemove = (fileToRemove: UploadFile) => {
    this.setState((prevState) => {
      const phaseFiles = prevState.phaseFiles.filter(
        (file) => file.base64 !== fileToRemove.base64
      );
      const phaseFilesToRemove = [
        ...(prevState.phaseFilesToRemove || []),
        fileToRemove,
      ];

      return {
        phaseFiles,
        phaseFilesToRemove,
        submitState: 'enabled',
      };
    });
  };

  handleOnSubmit = async (event: FormEvent<any>) => {
    event.preventDefault();
    eventEmitter.emit('getParticipationContext');
  };

  getAttributeDiff = (
    participationContextConfig: IParticipationContextConfig
  ) => {
    const attributeDiff: IUpdatedPhaseProperties = {
      ...this.state.attributeDiff,
      ...participationContextConfig,
    };

    return attributeDiff;
  };

  handleParticipationContextOnChange = (
    participationContextConfig: IParticipationContextConfig
  ) => {
    this.setState({
      submitState: 'enabled',
      attributeDiff: this.getAttributeDiff(participationContextConfig),
    });
  };

  handleParticipationContextOnSubmit = (
    participationContextConfig: IParticipationContextConfig
  ) => {
    const { phase } = this.state;
    const { projectId } = this.props.params;
    const attributeDiff = this.getAttributeDiff(participationContextConfig);
    this.save(projectId, phase, attributeDiff);
  };

  save = async (
    projectId: string | null,
    phase: IPhase | null,
    attributeDiff: IUpdatedPhaseProperties
  ) => {
    if (!isEmpty(attributeDiff) && !this.state.processing) {
      try {
        const { phaseFiles, phaseFilesToRemove } = this.state;
        let phaseResponse = phase;
        let redirect = false;

        this.setState({ processing: true });

        if (!isEmpty(attributeDiff)) {
          if (phase) {
            phaseResponse = await updatePhase(phase.data.id, attributeDiff);
            this.setState({ attributeDiff: {} });
          } else if (projectId) {
            phaseResponse = await addPhase(projectId, attributeDiff);
            redirect = true;
          }
        }

        if (phaseResponse) {
          const phaseId = phaseResponse.data.id;
          const filesToAddPromises = phaseFiles
            .filter((file) => !file.remote)
            .map((file) => addPhaseFile(phaseId, file.base64, file.name));
          const filesToRemovePromises = phaseFilesToRemove
            .filter((file) => file.remote)
            .map((file) => deletePhaseFile(phaseId, file.id as string));

          await Promise.all([
            ...filesToAddPromises,
            ...filesToRemovePromises,
          ] as Promise<any>[]);
        }

        this.setState({
          phaseFilesToRemove: [],
          processing: false,
          saved: true,
          errors: null,
          submitState: 'success',
        });

        if (redirect) {
          clHistory.push(`/admin/projects/${projectId}/timeline/`);
        }
      } catch (errors) {
        this.setState({
          errors: get(errors, 'json.errors', null),
          processing: false,
          saved: false,
          submitState: 'error',
        });
      }
    }
  };

  quillMultilocLabel = (<FormattedMessage {...messages.descriptionLabel} />);

  getStartDate = () => {
    const { phase, attributeDiff } = this.state;
    const { phases } = this.props;
    const phaseAttrs = phase
      ? { ...phase.data.attributes, ...attributeDiff }
      : { ...attributeDiff };
    let startDate: Moment | null = null;

    // If this is a new phase
    if (!phase) {
      const previousPhase = phases && phases[phases.length - 1];
      const previousPhaseEndDate = previousPhase
        ? moment(previousPhase.attributes.end_at)
        : null;

      // And there's a previous phase (end date) and the phase hasn't been picked/changed
      if (previousPhaseEndDate && !phaseAttrs.start_at) {
        // Make startDate the previousEndDate + 1 day
        startDate = previousPhaseEndDate.add(1, 'day');
        // However, if there's been a manual change to this start date
      } else if (phaseAttrs.start_at) {
        // Take this date as the start date
        startDate = moment(phaseAttrs.start_at);
      }
      // Otherwise, there is no date yet and it should remain 'null'

      // else there is already a phase (which means we're in the edit form)
      // and we take it from the attrs
    } else {
      if (phaseAttrs.start_at) {
        startDate = moment(phaseAttrs.start_at);
      }
    }

    return startDate;
  };

  render() {
    const { loaded } = this.state;

    if (loaded) {
      const {
        errors,
        phase,
        attributeDiff,
        processing,
        phaseFiles,
        submitState,
      } = this.state;
      const phaseAttrs = phase
        ? { ...phase.data.attributes, ...attributeDiff }
        : { ...attributeDiff };
      const startDate = this.getStartDate();
      const endDate = phaseAttrs.end_at ? moment(phaseAttrs.end_at) : null;

      return (
        <>
          <SectionTitle>
            {phase && <FormattedMessage {...messages.editPhaseTitle} />}
            {!phase && <FormattedMessage {...messages.newPhaseTitle} />}
          </SectionTitle>

          <PhaseForm onSubmit={this.handleOnSubmit}>
            <Section>
              <SectionField>
                <InputMultilocWithLocaleSwitcher
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
                  phase={phase}
                  phaseId={phase ? phase.data.id : null}
                  onSubmit={this.handleParticipationContextOnSubmit}
                  onChange={this.handleParticipationContextOnChange}
                  apiErrors={errors}
                />
              </SectionField>

              <SectionField>
                <Label>
                  <FormattedMessage {...messages.datesLabel} />
                </Label>
                <DateRangePicker
                  startDateId={'startDate'}
                  endDateId={'endDate'}
                  startDate={startDate}
                  endDate={endDate}
                  onDatesChange={this.handleDateUpdate}
                />
                <Error apiErrors={errors && errors.start_at} />
                <Error apiErrors={errors && errors.end_at} />
              </SectionField>

              <SectionField className="fullWidth">
                <QuillMultilocWithLocaleSwitcher
                  id="description"
                  label={this.quillMultilocLabel}
                  valueMultiloc={phaseAttrs.description_multiloc}
                  onChange={this.handleEditorOnChange}
                  withCTAButton
                />
                <Error apiErrors={errors && errors.description_multiloc} />
              </SectionField>

              <SectionField>
                <FileUploader
                  id="project-timeline-edit-form-file-uploader"
                  onFileAdd={this.handlePhaseFileOnAdd}
                  onFileRemove={this.handlePhaseFileOnRemove}
                  files={phaseFiles}
                  apiErrors={errors}
                />
              </SectionField>

              {errors && errors.project && (
                <SectionField>
                  <Error apiErrors={errors.project} />
                </SectionField>
              )}
              {errors && errors.base && (
                <SectionField>
                  <Error apiErrors={errors.base} />
                </SectionField>
              )}
            </Section>

            <SubmitWrapper
              loading={processing}
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

const AdminProjectTimelineEditWithHOCs = injectIntl(AdminProjectTimelineEdit);

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  phases: ({ params, render }) => (
    <GetPhases projectId={params.projectId}>{render}</GetPhases>
  ),
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <AdminProjectTimelineEditWithHOCs {...dataProps} {...inputProps} />
    )}
  </Data>
));
