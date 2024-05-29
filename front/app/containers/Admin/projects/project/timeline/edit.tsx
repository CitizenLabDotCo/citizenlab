import React, { FormEvent, useEffect, useState, MouseEvent } from 'react';

import {
  Text,
  CheckboxWithLabel,
  Box,
  Title,
  IconTooltip,
  colors,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import moment, { Moment } from 'moment';
import { useParams } from 'react-router-dom';
import { CLErrors, UploadFile, Multiloc } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
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

import DateRangePicker from 'components/admin/DateRangePicker';
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
import Warning from 'components/UI/Warning';

import {
  FormattedMessage,
  useIntl,
  useFormatMessageWithLocale,
} from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import PhaseParticipationConfig, {
  IPhaseParticipationConfig,
} from '../phase/phaseParticipationConfig';

import CampaignRow from './CampaignRow';
import messages from './messages';
import { getExcludedDates, getMaxEndDate, getTimelineTab } from './utils';

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

const AdminPhaseEdit = () => {
  const { data: appConfig } = useAppConfiguration();
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
  const { formatMessage } = useIntl();
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const [hasEndDate, setHasEndDate] = useState<boolean>(false);
  const [disableNoEndDate, setDisableNoEndDate] = useState<boolean>(false);
  const { width, containerRef } = useContainerWidthAndHeight();
  const tenantLocales = useAppConfigurationLocales();

  useEffect(() => {
    setHasEndDate(phase?.data.attributes.end_at ? true : false);
    setAttributeDiff({});
    setSubmitState(phase ? 'enabled' : 'disabled');
  }, [phase]);

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

  const handleDateUpdate = ({
    startDate,
    endDate,
  }: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) => {
    setSubmitState('enabled');
    setAttributeDiff({
      ...attributeDiff,
      start_at: startDate ? startDate.locale('en').format('YYYY-MM-DD') : '',
      end_at: endDate ? endDate.locale('en').format('YYYY-MM-DD') : '',
    });
    setHasEndDate(!!endDate);

    if (startDate && phases) {
      const hasPhaseWithLaterStartDate = phases.data.some((iteratedPhase) => {
        const iteratedPhaseStartDate = moment(
          iteratedPhase.attributes.start_at
        );
        return iteratedPhaseStartDate.isAfter(startDate);
      });

      setDisableNoEndDate(hasPhaseWithLaterStartDate);

      if (hasPhaseWithLaterStartDate) {
        setHasEndDate(true);
      }
    }
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

  const getAttributeDiff = (
    participationContextConfig: IPhaseParticipationConfig
  ) => {
    return {
      ...attributeDiff,
      ...participationContextConfig,
    };
  };

  const handlePhaseParticipationConfigChange = (
    participationContextConfig: IPhaseParticipationConfig
  ) => {
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
    setAttributeDiff({
      ...getAttributeDiff(participationContextConfig),
      ...(participationContextConfig.participation_method === 'native_survey' &&
        !attributeDiff.native_survey_button_multiloc &&
        !phase?.data.attributes.native_survey_button_multiloc && {
          native_survey_button_multiloc: surveyCTALabel,
        }),
      ...(participationContextConfig.participation_method === 'native_survey' &&
        !attributeDiff.native_survey_title_multiloc &&
        !phase?.data.attributes.native_survey_button_multiloc && {
          native_survey_title_multiloc: surveyTitle,
        }),
    });
  };

  const handlePhaseParticipationConfigSubmit = (
    participationContextConfig: IPhaseParticipationConfig
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
        const start = getStartDate();
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

  const getStartDate = () => {
    const phaseAttrs = phase
      ? { ...phase.data.attributes, ...attributeDiff }
      : { ...attributeDiff };
    let startDate: Moment | null = null;

    // If this is a new phase
    if (!phase) {
      const previousPhase =
        !isNilOrError(phases) && phases.data[phases.data.length - 1];
      const previousPhaseEndDate =
        previousPhase && previousPhase.attributes.end_at
          ? moment(previousPhase.attributes.end_at)
          : null;
      const previousPhaseStartDate =
        previousPhase && previousPhase.attributes.start_at
          ? moment(previousPhase.attributes.start_at)
          : null;

      // And there's a previous phase (end date) and the phase hasn't been picked/changed
      if (previousPhaseEndDate && !phaseAttrs.start_at) {
        // Make startDate the previousEndDate + 1 day
        startDate = previousPhaseEndDate.add(1, 'day');
        // However, if there's been a manual change to this start date
      } else if (phaseAttrs.start_at) {
        // Take this date as the start date
        startDate = moment(phaseAttrs.start_at);
      } else if (!previousPhaseEndDate && previousPhaseStartDate) {
        // If there is no previous end date, then the previous phase is open ended
        // Set the default start date to the previous start date + 2 days to account for single day phases
        startDate = previousPhaseStartDate.add(2, 'day');
      } else if (!startDate) {
        // If there is no start date at this point, then set the default start date to today
        startDate = moment();
      }

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
  const phasesWithOutCurrentPhase = phases
    ? phases.data.filter((iteratedPhase) => iteratedPhase.id !== phase?.data.id)
    : [];
  const excludeDates = getExcludedDates(phasesWithOutCurrentPhase);

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

  const setNoEndDate = () => {
    if (endDate) {
      setSubmitState('enabled');
      setAttributeDiff({
        ...attributeDiff,
        end_at: '',
      });
    }
    setHasEndDate((prevValue) => !prevValue);
  };

  const maxEndDate = getMaxEndDate(phasesWithOutCurrentPhase, startDate, phase);

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

          <SectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.datesLabel} />
            </SubSectionTitle>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDatesChange={handleDateUpdate}
              startDatePlaceholderText={formatMessage(messages.startDate)}
              endDatePlaceholderText={formatMessage(messages.endDate)}
              excludeDates={excludeDates}
              maxDate={maxEndDate}
            />
            <Error apiErrors={errors && errors.start_at} />
            <Error apiErrors={errors && errors.end_at} />
            <CheckboxWithLabel
              checked={!hasEndDate}
              onChange={setNoEndDate}
              disabled={disableNoEndDate}
              size="21px"
              label={
                <Text>
                  <FormattedMessage {...messages.noEndDateCheckbox} />
                </Text>
              }
            />
            {!hasEndDate && (
              <Warning>
                <>
                  <FormattedMessage {...messages.noEndDateWarningTitle} />
                  <ul>
                    <li>
                      <FormattedMessage {...messages.noEndDateWarningBullet1} />
                    </li>
                    <li>
                      <FormattedMessage {...messages.noEndDateWarningBullet2} />
                    </li>
                  </ul>
                </>
              </Warning>
            )}
          </SectionField>

          {/* TODO: After PhaseParticipationConfig refactor, it doesn't refetch phase service anymore
            This caused a bug where phase data was not being used after fetching. This is a temporary fix.
            PhaseParticipationConfig needs to be refactored to functional component. */}
          <PhaseParticipationConfig
            phase={phase}
            onSubmit={handlePhaseParticipationConfigSubmit}
            onChange={handlePhaseParticipationConfigChange}
            apiErrors={errors}
            appConfig={appConfig}
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
                        // The native_survey parameter is needed to distinguish between the native survey and regular ideas for layout purposes
                        `/projects/${project?.data.attributes.slug}/ideas/new?phase_id=${phaseId}&native_survey=true`,
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
            <Box display="flex">
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
