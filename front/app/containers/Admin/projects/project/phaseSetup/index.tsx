import React, {
  FormEvent,
  useEffect,
  useState,
  MouseEvent,
  useCallback,
} from 'react';

import {
  Text,
  Box,
  Title,
  IconTooltip,
  colors,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { CLErrors, UploadFile, Multiloc } from 'typings';

import { CampaignName } from 'api/campaigns/types';
import useCampaigns from 'api/campaigns/useCampaigns';
import { IPhaseFiles } from 'api/phase_files/types';
import useAddPhaseFile from 'api/phase_files/useAddPhaseFile';
import useDeletePhaseFile from 'api/phase_files/useDeletePhaseFile';
import usePhaseFiles from 'api/phase_files/usePhaseFiles';
import { IPhase, IPhaseData, IUpdatedPhaseProperties } from 'api/phases/types';
import useAddPhase from 'api/phases/useAddPhase';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import useProjectById from 'api/projects/useProjectById';

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
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import FileUploader from 'components/UI/FileUploader';
import { FileType } from 'components/UI/FileUploader/FileDisplay';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import { FormattedMessage, useFormatMessageWithLocale } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import eventEmitter from 'utils/eventEmitter';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import CampaignRow from './components/CampaignRow';
import DateSetup from './components/DateSetup';
import PhaseParticipationConfig from './components/PhaseParticipationConfig';
import { IPhaseParticipationConfig } from './components/PhaseParticipationConfig/utils/participationMethodConfigs';
import messages from './messages';
import { SubmitStateType } from './typings';
import { getTimelineTab, getStartDate } from './utils';

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

const AdminPhaseEdit = () => {
  const { mutateAsync: addPhaseFile } = useAddPhaseFile();
  const { mutateAsync: deletePhaseFile } = useDeletePhaseFile();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const { data: project } = useProjectById(projectId);
  const { data: phaseFiles } = usePhaseFiles(phaseId || null);
  const { data: phaseData } = usePhase(phaseId || null);
  const phase = phaseId ? phaseData : undefined;
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
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const { width, containerRef } = useContainerWidthAndHeight();
  const tenantLocales = useAppConfigurationLocales();

  useEffect(() => {
    setAttributeDiff({});
    setSubmitState('disabled');
  }, [phaseId]);

  useEffect(() => {
    if (phaseFiles) {
      setInStatePhaseFiles(convertToFileType(phaseFiles));
    }
  }, [phaseFiles]);

  const handlePhaseParticipationConfigChange = useCallback(
    (participationContextConfig: IPhaseParticipationConfig) => {
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
      setAttributeDiff((attributeDiff) => ({
        ...attributeDiff,
        ...participationContextConfig,
        ...(participationContextConfig.participation_method ===
          'native_survey' &&
          !attributeDiff.native_survey_button_multiloc &&
          !phase?.data.attributes.native_survey_button_multiloc && {
            native_survey_button_multiloc: surveyCTALabel,
          }),
        ...(participationContextConfig.participation_method ===
          'native_survey' &&
          !attributeDiff.native_survey_title_multiloc &&
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

  if (!campaigns) return null;

  const flatCampaigns = campaigns.pages.flatMap((page) => page.data);
  const initialCampaignsSettings = flatCampaigns.reduce((acc, campaign) => {
    acc[campaign.attributes.campaign_name] = campaign.attributes.enabled;
    return acc;
  }, {});

  const phaseAttrs: IUpdatedPhaseProperties = phase
    ? { ...phase.data.attributes, ...attributeDiff }
    : { campaigns_settings: initialCampaignsSettings, ...attributeDiff };

  const handleTitleMultilocOnChange = (title_multiloc: Multiloc) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      title_multiloc,
    });
  };

  const handleSurveyTitleChange = (surveyTitle: Multiloc) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      native_survey_title_multiloc: surveyTitle,
    });
  };

  const handleSurveyCTAChange = (CTATitle: Multiloc) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      native_survey_button_multiloc: CTATitle,
    });
  };

  const handleEditorOnChange = (description_multiloc: Multiloc) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      description_multiloc,
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
    eventEmitter.emit('getPhaseParticipationConfig');
  };

  const handlePhaseParticipationConfigSubmit = (
    participationContextConfig: IPhaseParticipationConfig
  ) => {
    // Important to keep the order of the spread operators
    save(projectId, phase?.data, {
      ...attributeDiff,
      ...participationContextConfig,
    });
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

    await Promise.all([...filesToAddPromises, ...filesToRemovePromises])
      .then(() => {
        setPhaseFilesToRemove([]);
        setProcessing(false);
        setErrors(null);
        setSubmitState('success');

        setAttributeDiff({});

        if (redirectAfterSave) {
          const redirectTab = getTimelineTab(phaseResponse);
          window.scrollTo(0, 0);
          clHistory.push(
            `/admin/projects/${projectId}/phases/${phaseId}/${redirectTab}`
          );
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

  const save = async (
    projectId: string | null,
    phase: IPhaseData | undefined,
    attributeDiff: IUpdatedPhaseProperties
  ) => {
    if (!isEmpty(attributeDiff) && !processing) {
      setProcessing(true);
      if (!isEmpty(attributeDiff)) {
        const start = getStartDate({
          phase,
          phases,
          attributeDiff,
        });
        const end = phaseAttrs.end_at ? moment(phaseAttrs.end_at) : null;

        // If the start date was automatically calculated, we need to update the dates in submit if even if the user didn't change them
        const updatedAttr = {
          ...attributeDiff,
          ...(!attributeDiff.start_at &&
            start && {
              start_at: start.locale('en').format('YYYY-MM-DD'),
              end_at:
                attributeDiff.end_at ||
                (end ? end.locale('en').format('YYYY-MM-DD') : ''),
            }),
        };

        if (phase) {
          updatePhase(
            { phaseId: phase.id, ...updatedAttr },
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
              ...updatedAttr,
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

  const handleCampaignEnabledOnChange = (campaign: CampaignData) => {
    setSubmitState('enabled');
    const campaignKey = campaign.attributes.campaign_name;

    setAttributeDiff({
      ...attributeDiff,
      campaigns_settings: {
        ...phaseAttrs.campaigns_settings,
        [campaignKey]: !phaseAttrs?.campaigns_settings?.[campaignKey],
      },
    });
  };

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
              valueMultiloc={phaseAttrs.title_multiloc}
              onChange={handleTitleMultilocOnChange}
            />
            <Error apiErrors={errors && errors.title_multiloc} />
          </SectionField>

          <DateSetup
            attributeDiff={attributeDiff}
            errors={errors}
            setSubmitState={setSubmitState}
            setAttributeDiff={setAttributeDiff}
          />

          <PhaseParticipationConfig
            phaseAttrs={phaseAttrs}
            phase={phase}
            onSubmit={handlePhaseParticipationConfigSubmit}
            onChange={handlePhaseParticipationConfigChange}
            apiErrors={errors}
          />
          {phaseAttrs.participation_method === 'native_survey' && (
            <>
              <SectionField>
                <SubSectionTitle>
                  <FormattedMessage {...messages.surveyTitleLabel} />
                </SubSectionTitle>
                <InputMultilocWithLocaleSwitcher
                  id="title"
                  type="text"
                  valueMultiloc={phaseAttrs.native_survey_title_multiloc}
                  onChange={handleSurveyTitleChange}
                />
                <Error
                  apiErrors={errors && errors.native_survey_title_multiloc}
                />
              </SectionField>

              <SectionField>
                <SubSectionTitle>
                  <FormattedMessage {...messages.surveyCTALabel} />
                </SubSectionTitle>
                <InputMultilocWithLocaleSwitcher
                  id="title"
                  type="text"
                  valueMultiloc={phaseAttrs.native_survey_button_multiloc}
                  onChange={handleSurveyCTAChange}
                />
                <Error
                  apiErrors={errors && errors.native_survey_button_multiloc}
                />
              </SectionField>

              <SectionField>
                <SubSectionTitle>
                  <FormattedMessage {...messages.previewSurveyCTALabel} />
                </SubSectionTitle>
                <Button
                  width="fit-content"
                  onClick={(event: MouseEvent) => {
                    if (phase) {
                      window.open(
                        `/projects/${project?.data.attributes.slug}/surveys/new?phase_id=${phaseId}`,
                        '_blank'
                      );
                    }
                    event.preventDefault();
                  }}
                >
                  {localize(phaseAttrs.native_survey_button_multiloc)}
                </Button>
              </SectionField>
            </>
          )}
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
                    !!phaseAttrs?.campaigns_settings?.[
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

export default AdminPhaseEdit;
