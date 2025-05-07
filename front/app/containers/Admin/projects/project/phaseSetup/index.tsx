import React, { FormEvent, useEffect, useState, useCallback } from 'react';

import {
  Text,
  Box,
  Title,
  IconTooltip,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { CLErrors, UploadFile, Multiloc } from 'typings';

import { CampaignName, ICampaignData } from 'api/campaigns/types';
import useCampaigns from 'api/campaigns/useCampaigns';
import { IPhaseFiles } from 'api/phase_files/types';
import usePhaseFiles from 'api/phase_files/usePhaseFiles';
import { IPhase, IUpdatedPhaseProperties } from 'api/phases/types';
import useAddPhase from 'api/phases/useAddPhase';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import { useSyncPhaseFiles } from 'hooks/files/useSyncPhaseFiles';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useContainerWidthAndHeight from 'hooks/useContainerWidthAndHeight';
import useLocalize from 'hooks/useLocalize';

import { CampaignData } from 'containers/Admin/messaging/AutomatedEmails/types';
import { stringifyCampaignFields } from 'containers/Admin/messaging/AutomatedEmails/utils';

import {
  Section,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Error from 'components/UI/Error';
import FileUploader from 'components/UI/FileUploader';
import { FileType } from 'components/UI/FileUploader/FileDisplay';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import {
  FormattedMessage,
  useFormatMessageWithLocale,
  useIntl,
} from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import CampaignRow from './components/CampaignRow';
// import DateSetup from './components/DateSetup';
import DateSetup from './components/DateSetup';
import PhaseParticipationConfig from './components/PhaseParticipationConfig';
import { ideationDefaultConfig } from './components/PhaseParticipationConfig/utils/participationMethodConfigs';
import messages from './messages';
import { SubmitStateType, ValidationErrors } from './typings';
import { getTimelineTab } from './utils';
import validate from './validate';

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

interface Props {
  projectId: string;
  phase: IPhase | undefined;
  flatCampaigns: ICampaignData[];
}

const AdminPhaseEdit = ({ projectId, phase, flatCampaigns }: Props) => {
  const phaseId = phase?.data.id;
  const { data: phaseFiles } = usePhaseFiles(phaseId || null);
  const { data: phases } = usePhases(projectId);
  const { mutate: addPhase } = useAddPhase();
  const { mutate: updatePhase } = useUpdatePhase();
  const syncPhaseFiles = useSyncPhaseFiles();
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [inStatePhaseFiles, setInStatePhaseFiles] = useState<FileType[]>(
    convertToFileType(phaseFiles)
  );
  const [phaseFilesToRemove, setPhaseFilesToRemove] = useState<FileType[]>([]);
  const [submitState, setSubmitState] = useState<SubmitStateType>('disabled');
  const [formData, setFormData] = useState<IUpdatedPhaseProperties>();
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const { width, containerRef } = useContainerWidthAndHeight();
  const tenantLocales = useAppConfigurationLocales();

  const initialCampaignsSettings = flatCampaigns.reduce((acc, campaign) => {
    acc[campaign.attributes.campaign_name] = campaign.attributes.enabled;
    return acc;
  }, {});

  useEffect(() => {
    // Whenever the selected phase changes, we reset the form data.
    // If no phase is selected, we initialize the form data with default values.
    setFormData(
      phase
        ? phase.data.attributes
        : {
            campaigns_settings: initialCampaignsSettings,
            ...ideationDefaultConfig,
          }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phaseFiles) {
      setInStatePhaseFiles(convertToFileType(phaseFiles));
    }
  }, [phaseFiles]);

  const handlePhaseParticipationConfigChange = useCallback(
    (participationContextConfig: IUpdatedPhaseProperties) => {
      const surveyCTALabel = tenantLocales?.reduce((acc, locale) => {
        acc[locale] = formatMessageWithLocale(
          locale,
          messages.defaultSurveyCTALabel
        );
        return acc;
      }, {});

      const surveyTitle = tenantLocales?.reduce((acc, locale) => {
        acc[locale] = formatMessageWithLocale(
          locale,
          messages.defaultSurveyTitleLabel
        );
        return acc;
      }, {});

      setSubmitState('enabled');
      // Important to keep the order of the spread operators
      setFormData((formData) => ({
        ...formData,
        ...participationContextConfig,
        ...(participationContextConfig.participation_method ===
          'native_survey' &&
          !formData?.native_survey_button_multiloc &&
          !phase?.data.attributes.native_survey_button_multiloc && {
            native_survey_button_multiloc: surveyCTALabel,
          }),
        ...(participationContextConfig.participation_method ===
          'native_survey' &&
          !formData?.native_survey_title_multiloc &&
          !phase?.data.attributes.native_survey_button_multiloc && {
            native_survey_title_multiloc: surveyTitle,
          }),
      }));
    },
    [
      formatMessageWithLocale,
      phase?.data.attributes.native_survey_button_multiloc,
      tenantLocales,
    ]
  );

  const updateFormData = (newData: Partial<IUpdatedPhaseProperties>) => {
    setSubmitState('enabled');
    setFormData((formData) => ({
      ...formData,
      ...newData,
    }));
  };

  const handleTitleMultilocOnChange = (title_multiloc: Multiloc) => {
    updateFormData({ title_multiloc });
  };

  const handleEditorOnChange = (description_multiloc: Multiloc) => {
    updateFormData({ description_multiloc });
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
        : // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          [...(inStatePhaseFiles || []), modifiedNewFile]
    );
    setSubmitState(isDuplicate ? submitState : 'enabled');
  };

  const handlePhaseFileOnRemove = (fileToRemove: FileType) => {
    setInStatePhaseFiles(
      inStatePhaseFiles.filter((file) => file.name !== fileToRemove.name)
    );
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    setPhaseFilesToRemove([...(phaseFilesToRemove || []), fileToRemove]);
    setSubmitState('enabled');
  };

  const handleFilesReorder = (updatedFiles: UploadFile[]) => {
    setInStatePhaseFiles(updatedFiles);
    setSubmitState('enabled');
  };

  const handleOnSubmit = async (event: FormEvent<any>) => {
    event.preventDefault();
    if (!formData) return;

    const { isValidated, errors } = validate(
      formData,
      phases,
      formatMessage,
      tenantLocales
    );

    setValidationErrors(errors);

    if (isValidated) {
      save(formData);
    }
  };

  const handleError = (error: { errors: CLErrors }) => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

    const initialFileOrdering = phaseFiles?.data.reduce((acc, file) => {
      if (file.id) {
        acc[file.id] = file.attributes.ordering;
      }
      return acc;
    }, {});

    await syncPhaseFiles({
      phaseId,
      phaseFiles: inStatePhaseFiles,
      filesToRemove: phaseFilesToRemove,
      fileOrdering: initialFileOrdering || {},
    })
      .then(() => {
        setPhaseFilesToRemove([]);
        setProcessing(false);
        setErrors(null);
        setSubmitState('success');

        if (redirectAfterSave) {
          const redirectTab = getTimelineTab(phaseResponse);
          window.scrollTo(0, 0);
          clHistory.push(
            `/admin/projects/${projectId}/phases/${phaseId}/${redirectTab}`
          );
        } else {
          setFormData(response.data.attributes);
        }
      })
      .catch(({ errors }) => {
        // For some reason, the BE adds a 'blank' error
        // to the file errors array when the real error is
        // extension_whitelist_error. So if we get that error,
        // we filter out the blank error and only show the
        // extension_whitelist_error.
        errors.file[0].error === 'extension_whitelist_error'
          ? setErrors({ file: [errors.file[0]] })
          : setErrors({ ...errors });

        setProcessing(false);
        setSubmitState('error');
      });
  };

  const save = async (formData: IUpdatedPhaseProperties) => {
    if (processing) return;
    setProcessing(true);

    if (phase) {
      updatePhase(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        {
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          phaseId: phase?.data.id,
          ...formData,
        },
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
          ...formData,
        },
        {
          onSuccess: (response) => {
            handleSaveResponse(response, true);
          },
          onError: handleError,
        }
      );
    }
  };

  const handleCampaignEnabledOnChange = (campaign: CampaignData) => {
    const campaignKey = campaign.attributes.campaign_name;

    updateFormData({
      campaigns_settings: {
        ...formData?.campaigns_settings,
        [campaignKey]: !formData?.campaigns_settings?.[campaignKey],
      },
    });
  };

  if (!formData) return null;

  return (
    <Box ref={containerRef}>
      <Title variant="h3" color="primary">
        {phase && <FormattedMessage {...messages.editPhaseTitle} />}
        {!phase && <FormattedMessage {...messages.newPhaseTitle} />}
      </Title>
      <form onSubmit={handleOnSubmit}>
        <Section>
          <SectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.titleLabel} />
            </SubSectionTitle>
            <InputMultilocWithLocaleSwitcher
              id="title"
              type="text"
              valueMultiloc={formData.title_multiloc}
              onChange={handleTitleMultilocOnChange}
            />
            <Error apiErrors={errors && errors.title_multiloc} />
          </SectionField>
          <DateSetup
            formData={formData}
            errors={errors}
            validationErrors={validationErrors}
            setSubmitState={setSubmitState}
            setFormData={setFormData}
            setValidationErrors={setValidationErrors}
          />
          <PhaseParticipationConfig
            phase={phase}
            formData={formData}
            validationErrors={validationErrors}
            apiErrors={errors}
            onChange={handlePhaseParticipationConfigChange}
            setValidationErrors={setValidationErrors}
          />
          <SectionField className="fullWidth">
            <Box display="flex" alignItems="center">
              <SubSectionTitle>
                <FormattedMessage {...messages.descriptionLabel} />
              </SubSectionTitle>
              {phases && phases.data.length < 2 && (
                <IconTooltip
                  content={
                    <FormattedMessage {...messages.emptyDescriptionWarning} />
                  }
                />
              )}
            </Box>
            <QuillMultilocWithLocaleSwitcher
              id="description"
              valueMultiloc={formData.description_multiloc}
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
              onFileReorder={handleFilesReorder}
              files={inStatePhaseFiles}
              enableDragAndDrop
              multiple
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
                    // TODO: Fix this the next time the file is edited.
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    !!formData?.campaigns_settings?.[
                      campaign.attributes.campaign_name
                    ]
                  }
                  key={campaign.id}
                  handleOnEnabledToggle={handleCampaignEnabledOnChange}
                />
              ))}
            </SectionField>
          )}

          {/* TODO: Fix this the next time the file is edited. */}
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {errors && errors.project && (
            <SectionField>
              <Error apiErrors={errors.project} />
            </SectionField>
          )}
          {/* TODO: Fix this the next time the file is edited. */}
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {errors && errors.base && (
            <SectionField>
              <Error apiErrors={errors.base} />
            </SectionField>
          )}
        </Section>

        <Box
          position="fixed"
          borderTop={`1px solid ${colors.divider}`}
          bottom="0"
          w={`calc(${width}px + ${defaultAdminCardPadding * 2}px)`}
          ml={`-${defaultAdminCardPadding}px`}
          background={colors.white}
          display="flex"
          justifyContent="flex-start"
        >
          <Box py="8px" px={`${defaultAdminCardPadding}px`}>
            <SubmitWrapper
              loading={processing}
              status={submitState}
              messages={{
                buttonSave: messages.saveChangesLabel,
                buttonSuccess: messages.saveSuccessLabel,
                messageError: messages.saveErrorMessage,
                messageSuccess: messages.saveSuccessMessage,
              }}
            />
          </Box>
        </Box>
      </form>
    </Box>
  );
};

const CONFIGURABLE_CAMPAIGN_NAMES: CampaignName[] = ['project_phase_started'];

const AdminPhaseEditWrapper = () => {
  const { projectId, phaseId } = useParams();
  const { data: phase } = usePhase(phaseId);
  const { data: campaigns } = useCampaigns({
    campaignNames: CONFIGURABLE_CAMPAIGN_NAMES,
    pageSize: 250,
  });

  const flatCampaigns = campaigns?.pages.flatMap((page) => page.data);

  if (!projectId || !flatCampaigns) return null;

  const phaseLoading = phaseId && phase?.data.id !== phaseId;
  if (phaseLoading) return null;

  return (
    <AdminPhaseEdit
      projectId={projectId}
      phase={phaseId ? phase : undefined}
      flatCampaigns={flatCampaigns}
    />
  );
};

export default AdminPhaseEditWrapper;
