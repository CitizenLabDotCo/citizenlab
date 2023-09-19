// Libraries
import React, { FormEvent, useEffect, useState } from 'react';
import moment, { Moment } from 'moment';
import { isEmpty } from 'lodash-es';
import clHistory from 'utils/cl-router/history';

// Api
import { IPhaseFiles } from 'api/phase_files/types';
import eventEmitter from 'utils/eventEmitter';
import useAddPhaseFile from 'api/phase_files/useAddPhaseFile';
import useDeletePhaseFile from 'api/phase_files/useDeletePhaseFile';
import usePhaseFiles from 'api/phase_files/usePhaseFiles';
import usePhases from 'api/phases/usePhases';
import usePhase from 'api/phases/usePhase';
import useAddPhase from 'api/phases/useAddPhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// Components
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import Error from 'components/UI/Error';
import DateRangePicker from 'components/admin/DateRangePicker';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import {
  Section,
  SectionTitle,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';
import ParticipationContext, {
  IParticipationContextConfig,
} from '../participationContext';
import FileUploader from 'components/UI/FileUploader';
import { Text } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Typings
import { CLErrors, UploadFile, Multiloc } from 'typings';
import { IPhase, IPhaseData, IUpdatedPhaseProperties } from 'api/phases/types';

// Resources
import { FileType } from 'components/UI/FileUploader/FileDisplay';
import { useParams } from 'react-router-dom';

// utils
import { isNilOrError } from 'utils/helperUtils';
import useCampaigns from 'api/campaigns/useCampaigns';
import CampaignRow from './CampaignRow';
import useLocalize from 'hooks/useLocalize';
import { stringifyCampaignFields } from 'containers/Admin/messaging/AutomatedEmails/utils';
import { CampaignData } from 'containers/Admin/messaging/AutomatedEmails/types';
import { CampaignName } from 'api/campaigns/types';

type SubmitStateType = 'disabled' | 'enabled' | 'error' | 'success';

const convertToFileType = (phaseFiles: IPhaseFiles | undefined) => {
  if (phaseFiles) {
    const convertedFiles: FileType[] = [];
    phaseFiles.data.map((phaseFile) => {
      convertedFiles.push({
        id: phaseFile.id,
        url: phaseFile.attributes.file.url,
        name: phaseFile.attributes.name,
        size: phaseFile.attributes.size,
        remote: true,
      });
    });
    return convertedFiles;
  }
  return [];
};

const CONFIGURABLE_CAMPAIGN_NAMES: CampaignName[] = ['project_phase_started'];

const AdminProjectTimelineEdit = () => {
  const { data: appConfig } = useAppConfiguration();
  const { mutateAsync: addPhaseFile } = useAddPhaseFile();
  const { mutateAsync: deletePhaseFile } = useDeletePhaseFile();
  const { projectId, id: phaseId } = useParams() as {
    projectId: string;
    id: string;
  };
  const { data: phaseFiles } = usePhaseFiles(phaseId);
  const { data: phase } = usePhase(phaseId || null);
  const { data: phases } = usePhases(projectId);
  const { data: campaigns } = useCampaigns({
    campaignNames: CONFIGURABLE_CAMPAIGN_NAMES,
    pageSize: 250,
  });
  const { mutate: addPhase } = useAddPhase();
  const { mutate: updatePhase } = useUpdatePhase();
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [inStatePhaseFiles, setInStatePhaseFiles] = useState<FileType[]>(
    convertToFileType(phaseFiles)
  );
  const [phaseFilesToRemove, setPhaseFilesToRemove] = useState<FileType[]>([]);
  const [submitState, setSubmitState] = useState<SubmitStateType>('disabled');
  const [attributeDiff, setAttributeDiff] = useState<IUpdatedPhaseProperties>(
    {}
  );
  const localize = useLocalize();

  useEffect(() => {
    if (phaseFiles) {
      setInStatePhaseFiles(convertToFileType(phaseFiles));
    }
  }, [phaseFiles]);

  if (!campaigns) {
    return null;
  }

  const flatCampaigns = campaigns.pages.flatMap((page) => page.data);
  const initialCampaignsSettings = flatCampaigns.reduce((acc, campaign) => {
    acc[campaign.attributes.campaign_name] = campaign.attributes.enabled;
    return acc;
  }, {});

  const phaseAttrs = phase
    ? { ...phase.data.attributes, ...attributeDiff }
    : { campaigns_settings: initialCampaignsSettings, ...attributeDiff };

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
    save(projectId, phase?.data, attributeDiff);
  };

  const handleError = (error: { errors: CLErrors }) => {
    setErrors(error.errors || null);
    setProcessing(false);
    setSubmitState('error');
  };

  const handleSaveResponse = async (
    response: IPhase,
    redirectAfterSave: boolean
  ) => {
    const phaseResponse = response.data;
    const phaseId = phaseResponse.id;
    const filesToAddPromises = inStatePhaseFiles
      .filter((file): file is UploadFile => !file.remote)
      .map((file) =>
        addPhaseFile({ phaseId, base64: file.base64, name: file.name })
      );
    const filesToRemovePromises = phaseFilesToRemove
      .filter((file) => file.remote)
      .map((file) => deletePhaseFile({ phaseId, fileId: file.id as string }));

    await Promise.all([...filesToAddPromises, ...filesToRemovePromises]).then(
      () => {
        setPhaseFilesToRemove([]);
        setProcessing(false);
        setErrors(null);
        setSubmitState('success');

        setAttributeDiff({});

        if (redirectAfterSave) {
          clHistory.push(`/admin/projects/${projectId}/timeline/`);
        }
      }
    );
  };

  const save = async (
    projectId: string | null,
    phase: IPhaseData | undefined,
    attributeDiff: IUpdatedPhaseProperties
  ) => {
    if (!isEmpty(attributeDiff) && !processing) {
      setProcessing(true);
      if (!isEmpty(attributeDiff)) {
        if (phase) {
          updatePhase(
            { phaseId: phase.id, ...attributeDiff },
            {
              onSuccess: (response) => {
                handleSaveResponse(response, false);
              },
              onError: handleError,
            }
          );
        } else if (projectId) {
          addPhase(
            {
              projectId,
              campaigns_settings: initialCampaignsSettings,
              ...attributeDiff,
            },
            {
              onSuccess: (response) => {
                handleSaveResponse(response, true);
              },
              onError: handleError,
            }
          );
        }
      }
    }
  };

  const quillMultilocLabel = (
    <FormattedMessage {...messages.descriptionLabel} />
  );

  const getStartDate = () => {
    const phaseAttrs = phase
      ? { ...phase.data.attributes, ...attributeDiff }
      : { ...attributeDiff };
    let startDate: Moment | null = null;

    // If this is a new phase
    if (!phase) {
      const previousPhase =
        !isNilOrError(phases) && phases.data[phases.data.length - 1];
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

  const startDate = getStartDate();
  const endDate = phaseAttrs.end_at ? moment(phaseAttrs.end_at) : null;

  const handleCampaignEnabledOnChange = (campaign: CampaignData) => {
    setSubmitState('enabled');
    const campaignKey = campaign.attributes.campaign_name;

    setAttributeDiff({
      ...attributeDiff,
      campaigns_settings: {
        ...phaseAttrs.campaigns_settings,
        [campaignKey]: !phaseAttrs.campaigns_settings[campaignKey],
      },
    });
  };

  return (
    <>
      <SectionTitle>
        {phase && <FormattedMessage {...messages.editPhaseTitle} />}
        {!phase && <FormattedMessage {...messages.newPhaseTitle} />}
      </SectionTitle>

      <form onSubmit={handleOnSubmit}>
        <Section>
          <SectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.titleLabel} />
            </SubSectionTitle>
            <InputMultilocWithLocaleSwitcher
              id="title"
              type="text"
              valueMultiloc={phaseAttrs.title_multiloc}
              onChange={handleTitleMultilocOnChange}
            />
            <Error apiErrors={errors && errors.title_multiloc} />
          </SectionField>
          {/* TODO: After ParticipationContext refactor, it doesn't refetch phase service anymore
            This caused a bug where phase data was not being used after fetching. This is a temporary fix.
            ParticipationContext needs to be refactored to functional component. */}
          {phase && (
            <ParticipationContext
              phase={phase}
              onSubmit={handleParticipationContextOnSubmit}
              onChange={handleParticipationContextOnChange}
              apiErrors={errors}
              appConfig={appConfig}
            />
          )}
          {!phase && (
            <ParticipationContext
              phase={undefined}
              onSubmit={handleParticipationContextOnSubmit}
              onChange={handleParticipationContextOnChange}
              apiErrors={errors}
              appConfig={appConfig}
            />
          )}
          <SectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.datesLabel} />
            </SubSectionTitle>
            <DateRangePicker
              startDateId={'startDate'}
              endDateId={'endDate'}
              startDate={startDate}
              endDate={endDate}
              onDatesChange={handleDateUpdate}
              minimumNights={0}
            />
            <Error apiErrors={errors && errors.start_at} />
            <Error apiErrors={errors && errors.end_at} />
          </SectionField>

          <SectionField className="fullWidth">
            <SubSectionTitle>{quillMultilocLabel}</SubSectionTitle>
            <QuillMultilocWithLocaleSwitcher
              id="description"
              valueMultiloc={phaseAttrs.description_multiloc}
              onChange={handleEditorOnChange}
              withCTAButton
            />
            <Error apiErrors={errors && errors.description_multiloc} />
          </SectionField>

          <SectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.uploadAttachments} />
            </SubSectionTitle>
            <FileUploader
              id="project-timeline-edit-form-file-uploader"
              onFileAdd={handlePhaseFileOnAdd}
              onFileRemove={handlePhaseFileOnRemove}
              files={inStatePhaseFiles}
              apiErrors={errors}
            />
          </SectionField>

          {Object.keys(flatCampaigns).length > 0 && (
            <SectionField>
              <SubSectionTitle>
                <FormattedMessage {...messages.automatedEmails} />
              </SubSectionTitle>
              <Text color="coolGrey600" mt="0px" fontSize="m">
                <FormattedMessage {...messages.automatedEmailsDescription} />
              </Text>
              {flatCampaigns.map((campaign) => (
                <CampaignRow
                  campaign={stringifyCampaignFields(campaign, localize)}
                  checked={
                    phaseAttrs.campaigns_settings?.[
                      campaign.attributes.campaign_name
                    ]
                  }
                  key={campaign.id}
                  handleOnEnabledToggle={handleCampaignEnabledOnChange}
                />
              ))}
            </SectionField>
          )}

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
      </form>
    </>
  );
};

export default AdminProjectTimelineEdit;
