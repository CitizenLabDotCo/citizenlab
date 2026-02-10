import React, { useState } from 'react';

import {
  Box,
  Toggle,
  Spinner,
  Button,
  Dropdown,
  colors,
  Icon,
  Text,
  DropdownListItem,
} from '@citizenlab/cl2-component-library';
import { stringify } from 'qs';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';
import useUpdateAnalysis from 'api/analyses/useUpdateAnalysis';
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';
import { IPhaseData } from 'api/phases/types';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import useProjectById from 'api/projects/useProjectById';
import useFormSubmissionCount from 'api/submission_count/useSubmissionCount';
import useDeleteSurveyResults from 'api/survey_results/useDeleteSurveyResults';
import { downloadSurveyResults } from 'api/survey_results/utils';

import useLocale from 'hooks/useLocale';

import DeleteModal from 'components/admin/SurveyDeleteModal/SurveyDeleteModal';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { getFormActionsConfig } from 'utils/configs/formActionsConfig/utils';

import messages from '../../messages';
import { usePdfExportContext } from '../../pdf/PdfExportContext';

interface Props {
  phase: IPhaseData;
}

const SurveyActions = ({ phase }: Props) => {
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const projectId = phase.relationships.project.data.id;
  const phaseId = phase.id;

  const { downloadPdf, isDownloading: isDownloadingPdf } =
    usePdfExportContext();

  const { data: project } = useProjectById(projectId);
  const { mutate: updatePhase } = useUpdatePhase();

  const { mutate: deleteFormResults } = useDeleteSurveyResults();
  const { data: submissionCount } = useFormSubmissionCount({
    phaseId,
  });

  const { mutate: addAnalysis, isLoading: isAddLoading } = useAddAnalysis();
  const { mutate: updateAnalysis, isLoading: isUpdateLoading } =
    useUpdateAnalysis();
  const { data: analyses } = useAnalyses({ phaseId });
  const { data: inputCustomFields } = useRawCustomFields({
    projectId,
    phaseId,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDropdownOpened, setDropdownOpened] = useState(false);
  const [isDownloadingXlsx, setIsDownloadingXlsx] = useState(false);

  if (!project || !submissionCount) {
    return null;
  }

  const haveSubmissionsComeIn =
    submissionCount.data.attributes.totalSubmissions > 0;

  const { postingEnabled, togglePostingEnabled, inputImporterLink } =
    getFormActionsConfig(project.data, updatePhase, phase);

  const inputCustomFieldsIds = inputCustomFields?.data.map(
    (customField) => customField.id
  );

  const mainAnalysis = analyses?.data.find(
    (analysis) => analysis.relationships.main_custom_field?.data === null
  );

  const analysisCustomFieldIds =
    mainAnalysis?.relationships.additional_custom_fields?.data.map(
      (field) => field.id
    ) || [];

  const customFieldsMatchAnalysisAdditionalFields =
    inputCustomFieldsIds &&
    analysisCustomFieldIds.length === inputCustomFieldsIds.length &&
    analysisCustomFieldIds.every((id) => inputCustomFieldsIds.includes(id));

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const deleteResults = () => {
    deleteFormResults(
      { phaseId },
      {
        onSuccess: () => {
          closeDeleteModal();
        },
      }
    );
  };

  const handleDownloadXlsx = async () => {
    try {
      setIsDownloadingXlsx(true);
      setDropdownOpened(false);
      await downloadSurveyResults(locale, phase);
    } catch (error) {
      // eslint-disable-next-line no-empty
    } finally {
      setIsDownloadingXlsx(false);
    }
  };

  const openAnalysis = (analysisId: string) => {
    clHistory.push(
      `/admin/projects/${projectId}/analysis/${analysisId}?${stringify({
        phase_id: phaseId,
      })}`
    );
  };

  const goToAnalysis = () => {
    if (mainAnalysis?.id) {
      if (!customFieldsMatchAnalysisAdditionalFields) {
        updateAnalysis(
          {
            additional_custom_field_ids: inputCustomFieldsIds,
            id: mainAnalysis.id,
          },
          {
            onSuccess: () => {
              openAnalysis(mainAnalysis.id);
            },
          }
        );
      } else {
        openAnalysis(mainAnalysis.id);
      }
    } else {
      addAnalysis(
        {
          phaseId,
          additionalCustomFields: inputCustomFieldsIds,
        },
        {
          onSuccess: (response) => openAnalysis(response.data.id),
        }
      );
    }
  };

  const toggleDropdown = () => {
    setDropdownOpened(!isDropdownOpened);
  };

  const closeDropdown = () => {
    setDropdownOpened(false);
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setDropdownOpened(false);
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap="8px" data-pdf-exclude="true">
        {(isDownloadingXlsx || isDownloadingPdf) && <Spinner size="24px" />}
        <Box position="relative">
          <Button
            icon="dots-horizontal"
            iconColor={colors.textSecondary}
            iconHoverColor={colors.textSecondary}
            boxShadow="none"
            boxShadowHover="none"
            bgColor="transparent"
            bgHoverColor="transparent"
            pr="0"
            data-cy="e2e-more-survey-actions-button"
            onClick={toggleDropdown}
          />
          <Dropdown
            opened={isDropdownOpened}
            onClickOutside={closeDropdown}
            className="dropdown"
            width="auto"
            right="0px"
            top="45px"
            content={
              <Box minWidth="300px">
                <DropdownListItem
                  onClick={() => {
                    setDropdownOpened(false);
                    downloadPdf();
                  }}
                >
                  <Icon name="download" fill={colors.coolGrey600} mr="8px" />
                  <Text my="0px">
                    {formatMessage(messages.downloadInsightsPdf)}
                  </Text>
                </DropdownListItem>
                <DropdownListItem
                  onClick={handleDownloadXlsx}
                  data-cy="e2e-download-survey-results"
                >
                  <Icon name="download" fill={colors.coolGrey600} mr="8px" />
                  <Text my="0px">
                    {formatMessage(messages.downloadSurveyResults)} (.xlsx)
                  </Text>
                </DropdownListItem>
                {haveSubmissionsComeIn && (
                  <DropdownListItem
                    onClick={openDeleteModal}
                    data-cy="e2e-delete-survey-results"
                  >
                    <Icon name="delete" fill={colors.red600} mr="8px" />
                    <Text color="red600" my="0px">
                      {formatMessage(messages.deleteSurveyResults)}
                    </Text>
                  </DropdownListItem>
                )}
              </Box>
            }
          />
        </Box>
        <Box flexShrink={0} style={{ whiteSpace: 'nowrap' }}>
          <Toggle
            checked={postingEnabled}
            label={formatMessage(messages.openForResponses)}
            onChange={() => {
              togglePostingEnabled();
            }}
          />
        </Box>
        <ButtonWithLink
          linkTo={`/projects/${project.data.attributes.slug}/surveys/new?phase_id=${phaseId}`}
          buttonStyle="text"
          width="auto"
          openLinkInNewTab
        >
          {formatMessage(messages.newSubmission)}
        </ButtonWithLink>
        <ButtonWithLink
          linkTo={inputImporterLink}
          icon="page"
          iconSize="20px"
          buttonStyle="secondary-outlined"
          width="auto"
        >
          {formatMessage(messages.import)}
        </ButtonWithLink>
        <Button
          buttonStyle="primary"
          icon="stars"
          onClick={goToAnalysis}
          processing={isAddLoading || isUpdateLoading}
        >
          {formatMessage(messages.aiAnalysis)}
        </Button>
      </Box>
      <DeleteModal
        showDeleteModal={showDeleteModal}
        closeDeleteModal={closeDeleteModal}
        deleteResults={deleteResults}
      />
    </>
  );
};

export default SurveyActions;
