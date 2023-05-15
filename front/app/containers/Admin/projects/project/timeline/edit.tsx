// Libraries
import React, { FormEvent, useEffect, useState } from 'react';
import { Subscription, combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import moment, { Moment } from 'moment';
import { get, isEmpty } from 'lodash-es';
import clHistory from 'utils/cl-router/history';

// Services
import {
  phaseFilesStream,
  addPhaseFile,
  deletePhaseFile,
} from 'services/phaseFiles';
import {
  updatePhase,
  addPhase,
  IUpdatedPhaseProperties,
} from 'services/phases';
import eventEmitter from 'utils/eventEmitter';

// Components
import { Label } from '@citizenlab/cl2-component-library';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import Error from 'components/UI/Error';
import DateRangePicker from 'components/admin/DateRangePicker';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import ParticipationContext, {
  IParticipationContextConfig,
} from '../participationContext';
import FileUploader from 'components/UI/FileUploader';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';

// Typings
import { CLError, UploadFile, Multiloc } from 'typings';

// Resources
import { FileType } from 'components/UI/FileUploader/FileDisplay';
import { useParams } from 'react-router-dom';
import usePhases from 'hooks/usePhases';
import { isNilOrError } from 'utils/helperUtils';
import usePhase, { TPhase } from 'hooks/usePhase';

const PhaseForm = styled.form``;
type SubmitStateType = 'disabled' | 'enabled' | 'error' | 'success';

const AdminProjectTimelineEdit = () => {
  const { projectId, id: phaseId } = useParams() as {
    projectId: string;
    id?: string;
  };
  const phase = usePhase(phaseId || null);
  const phases = usePhases(projectId);
  const [errors, setErrors] = useState<{
    [fieldName: string]: CLError[];
  } | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [inStatePhaseFiles, setInStatePhaseFiles] = useState<FileType[]>([]);
  const [phaseFilesToRemove, setPhaseFilesToRemove] = useState<FileType[]>([]);
  const [submitState, setSubmitState] = useState<SubmitStateType>('disabled');
  const [attributeDiff, setAttributeDiff] = useState<IUpdatedPhaseProperties>(
    {}
  );

  useEffect(() => {
    if (phaseId) {
      const subscriptions: Subscription[] = [
        phaseFilesStream(phaseId)
          .observable.pipe(
            switchMap((phaseFiles) => {
              if (phaseFiles && phaseFiles.data && phaseFiles.data.length > 0) {
                return combineLatest(
                  phaseFiles.data.map((phaseFile) => {
                    const {
                      id,
                      attributes: {
                        name,
                        size,
                        file: { url },
                      },
                    } = phaseFile;

                    return of({
                      id,
                      url,
                      name,
                      size,
                      remote: true,
                    });
                  })
                );
              }
              return of([]);
            })
          )
          .subscribe((phaseFiles) => {
            setInStatePhaseFiles(phaseFiles as FileType[]);
          }),
      ];

      return () => {
        subscriptions.forEach((subscription) => subscription.unsubscribe());
      };
    }
    return;
  }, [phaseId, projectId]);

  const handleTitleMultilocOnChange = (title_multiloc: Multiloc) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      title_multiloc,
    });
  };

  const handleEditorOnChange = (description_multiloc: Multiloc) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      description_multiloc,
    });
  };

  const handleDateUpdate = ({
    startDate,
    endDate,
  }: {
    startDate: Moment;
    endDate: Moment;
  }) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      start_at: startDate ? startDate.locale('en').format('YYYY-MM-DD') : '',
      end_at: endDate ? endDate.locale('en').format('YYYY-MM-DD') : '',
    });
  };

  const handlePhaseFileOnAdd = (newFile: UploadFile) => {
    const modifiedNewFile = {
      name: newFile.name || newFile.filename,
      size: newFile.size,
      remote: false,
      base64: newFile.base64,
    };

    const isDuplicate = inStatePhaseFiles.some((file) => {
      if (file.base64 && newFile.base64) {
        return file.base64 === newFile.base64;
      }
      return file.name === newFile.name;
    });

    setInStatePhaseFiles(
      isDuplicate
        ? inStatePhaseFiles
        : [...(inStatePhaseFiles || []), modifiedNewFile]
    );
    setSubmitState(isDuplicate ? submitState : 'enabled');
  };

  const handlePhaseFileOnRemove = (fileToRemove: FileType) => {
    setInStatePhaseFiles(
      inStatePhaseFiles.filter((file) => file.name !== fileToRemove.name)
    );
    setPhaseFilesToRemove([...(phaseFilesToRemove || []), fileToRemove]);
    setSubmitState('enabled');
  };

  const handleOnSubmit = async (event: FormEvent<any>) => {
    event.preventDefault();
    eventEmitter.emit('getParticipationContext');
  };

  const getAttributeDiff = (
    participationContextConfig: IParticipationContextConfig
  ) => {
    return {
      ...attributeDiff,
      ...participationContextConfig,
    };
  };

  const handleParticipationContextOnChange = (
    participationContextConfig: IParticipationContextConfig
  ) => {
    setSubmitState('enabled');
    setAttributeDiff(getAttributeDiff(participationContextConfig));
  };

  const handleParticipationContextOnSubmit = (
    participationContextConfig: IParticipationContextConfig
  ) => {
    const attributeDiff = getAttributeDiff(participationContextConfig);
    save(projectId, phase, attributeDiff);
  };

  const save = async (
    projectId: string | null,
    phase: TPhase | null,
    attributeDiff: IUpdatedPhaseProperties
  ) => {
    if (!isEmpty(attributeDiff) && !processing) {
      try {
        let phaseResponse: TPhase;
        phaseResponse = phase;
        let redirect = false;
        setProcessing(true);
        if (!isEmpty(attributeDiff)) {
          if (!isNilOrError(phase)) {
            phaseResponse = (await updatePhase(phase.id, attributeDiff)).data;
            setAttributeDiff({});
          } else if (projectId) {
            phaseResponse = (await addPhase(projectId, attributeDiff)).data;
            redirect = true;
          }
        }

        if (!isNilOrError(phaseResponse)) {
          const phaseId = phaseResponse.id;
          const filesToAddPromises = inStatePhaseFiles
            .filter((file): file is UploadFile => !file.remote)
            .map((file) => addPhaseFile(phaseId, file.base64, file.name));
          const filesToRemovePromises = phaseFilesToRemove
            .filter((file) => file.remote)
            .map((file) => deletePhaseFile(phaseId, file.id as string));

          await Promise.all([
            ...filesToAddPromises,
            ...filesToRemovePromises,
          ] as Promise<any>[]);
        }

        setPhaseFilesToRemove([]);
        setProcessing(false);
        setErrors(null);
        setSubmitState('success');

        if (redirect) {
          clHistory.push(`/admin/projects/${projectId}/timeline/`);
        }
      } catch (errors) {
        setErrors(get(errors, 'json.errors', null));
        setProcessing(false);
        setSubmitState('error');
      }
    }
  };

  const quillMultilocLabel = (
    <FormattedMessage {...messages.descriptionLabel} />
  );

  const getStartDate = () => {
    const phaseAttrs = !isNilOrError(phase)
      ? { ...phase.attributes, ...attributeDiff }
      : { ...attributeDiff };
    let startDate: Moment | null = null;

    // If this is a new phase
    if (!phase) {
      const previousPhase = !isNilOrError(phases) && phases[phases.length - 1];
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

  const phaseAttrs = !isNilOrError(phase)
    ? { ...phase.attributes, ...attributeDiff }
    : { ...attributeDiff };
  const startDate = getStartDate();
  const endDate = phaseAttrs.end_at ? moment(phaseAttrs.end_at) : null;

  return (
    <>
      <SectionTitle>
        {phase && <FormattedMessage {...messages.editPhaseTitle} />}
        {!phase && <FormattedMessage {...messages.newPhaseTitle} />}
      </SectionTitle>

      <PhaseForm onSubmit={handleOnSubmit}>
        <Section>
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              id="title"
              label={<FormattedMessage {...messages.titleLabel} />}
              type="text"
              valueMultiloc={phaseAttrs.title_multiloc}
              onChange={handleTitleMultilocOnChange}
            />
            <Error apiErrors={errors && errors.title_multiloc} />
          </SectionField>
          <SectionField>
            <ParticipationContext
              phase={!isNilOrError(phase) ? { data: phase } : undefined}
              onSubmit={handleParticipationContextOnSubmit}
              onChange={handleParticipationContextOnChange}
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
              onDatesChange={handleDateUpdate}
            />
            <Error apiErrors={errors && errors.start_at} />
            <Error apiErrors={errors && errors.end_at} />
          </SectionField>

          <SectionField className="fullWidth">
            <QuillMultilocWithLocaleSwitcher
              id="description"
              label={quillMultilocLabel}
              valueMultiloc={phaseAttrs.description_multiloc}
              onChange={handleEditorOnChange}
              withCTAButton
            />
            <Error apiErrors={errors && errors.description_multiloc} />
          </SectionField>

          <SectionField>
            <FileUploader
              id="project-timeline-edit-form-file-uploader"
              onFileAdd={handlePhaseFileOnAdd}
              onFileRemove={handlePhaseFileOnRemove}
              files={inStatePhaseFiles}
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
};

export default AdminProjectTimelineEdit;
