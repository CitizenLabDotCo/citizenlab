import React, { useState } from 'react';

import {
  Box,
  Title,
  Text,
  Dropdown,
  DropdownListItem,
  Icon,
  Toggle,
  Spinner,
  colors,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { saveAs } from 'file-saver';
import { useParams } from 'react-router-dom';

import usePhase from 'api/phases/usePhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import useProjectById from 'api/projects/useProjectById';
import useFormSubmissionCount from 'api/submission_count/useSubmissionCount';
import useDeleteSurveyResults from 'api/survey_results/useDeleteSurveyResults';
import { downloadSurveyResults } from 'api/survey_results/utils';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useInputSchema from 'hooks/useInputSchema';
import useLocale from 'hooks/useLocale';

import PDFExportModal, {
  FormValues,
} from 'containers/Admin/projects/components/PDFExportModal';

import Button from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';
import UpsellTooltip from 'components/UpsellTooltip';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { requestBlob } from 'utils/requestBlob';

import CopySurveyModal from './CopySurveyModal';
import EditWarningModal from './EditWarningModal';
import FormResults from './FormResults';
import messages from './messages';
import { saveSurveyAsPDF } from './saveSurveyAsPDF';
import { getFormActionsConfig } from './utils';

const Forms = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { formatMessage } = useIntl();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isDropdownOpened, setDropdownOpened] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditWarningModal, setShowEditWarningModal] = useState(false);
  const [showCopySurveyModal, setShowCopySurveyModal] = useState(false);
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);
  const locale = useLocale();
  const { mutate: updatePhase } = useUpdatePhase();
  const { data: submissionCount } = useFormSubmissionCount({
    phaseId,
  });
  const { uiSchema } = useInputSchema({ projectId, phaseId });
  const inputImporterAllowed = useFeatureFlag({
    name: 'input_importer',
    onlyCheckAllowed: true,
  });
  const importPrintedFormsAllowed = useFeatureFlag({
    name: 'import_printed_forms',
    onlyCheckAllowed: true,
  });
  const { mutate: deleteFormResults } = useDeleteSurveyResults();

  if (!project || !phase || !submissionCount) {
    return null;
  }

  const {
    downloadPdfLink,
    downloadExcelLink,
    postingEnabled,
    togglePostingEnabled,
    editFormLink,
    inputImporterLink,
  } = getFormActionsConfig(project.data, updatePhase, phase.data);

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };
  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleDownloadResults = async () => {
    try {
      setIsDownloading(true);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      await downloadSurveyResults(locale, phase?.data);
    } catch (error) {
      // Not handling errors for now
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpened(!isDropdownOpened);
  };

  const closeDropdown = () => {
    setDropdownOpened(false);
  };

  const handleDownloadPDF = () => setExportModalOpen(true);

  const handleExportPDF = async ({ personal_data }: FormValues) => {
    await saveSurveyAsPDF({
      downloadPdfLink,
      locale,
      personal_data,
    });
  };

  const downloadExampleFile = async () => {
    const blob = await requestBlob(
      downloadExcelLink,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    saveAs(blob, 'example.xlsx');
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

  const haveSubmissionsComeIn =
    submissionCount.data.attributes.totalSubmissions > 0;

  const surveyFormPersisted =
    phase.data.attributes.custom_form_persisted || false;

  if (isDownloading) {
    return (
      <Box width="100%" height="100%" display="flex" alignItems="center">
        <Spinner />
      </Box>
    );
  }

  return (
    <>
      <Box width="100%">
        <Box
          width="100%"
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Title variant="h3" color="primary">
            {formatMessage(messages.surveyResponses)}
          </Title>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Box mr="16px">
              <Toggle
                checked={postingEnabled}
                label={formatMessage(messages.openForResponses)}
                onChange={() => {
                  togglePostingEnabled();
                }}
              />
            </Box>
            <Button
              linkTo={inputImporterLink}
              icon="page"
              iconSize="20px"
              buttonStyle="secondary-outlined"
              width="auto"
              mr="8px"
            >
              {formatMessage(messages.importInputs)}
            </Button>
            <Button
              linkTo={`/projects/${project.data.attributes.slug}/surveys/new?phase_id=${phase.data.id}`}
              icon="eye"
              iconSize="20px"
              buttonStyle="secondary-outlined"
              width="auto"
              openLinkInNewTab
              mr="8px"
            >
              {formatMessage(messages.viewSurveyText)}
            </Button>
            <Button
              icon="edit"
              iconSize="20px"
              buttonStyle="admin-dark"
              width="auto"
              onClick={() => {
                haveSubmissionsComeIn
                  ? setShowEditWarningModal(true)
                  : clHistory.push(editFormLink);
              }}
              data-cy="e2e-edit-survey-content"
            >
              {formatMessage(messages.editSurvey)}
            </Button>

            <Box>
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
                width="100%"
                right="70px"
                content={
                  <>
                    {uiSchema && (
                      <>
                        <DropdownListItem
                          onClick={() => {
                            setShowCopySurveyModal(true);
                          }}
                          disabled={haveSubmissionsComeIn}
                        >
                          <Icon
                            name="copy"
                            fill={
                              haveSubmissionsComeIn
                                ? colors.grey400
                                : colors.coolGrey600
                            }
                            mr="4px"
                          />
                          <Text
                            my="0px"
                            color={haveSubmissionsComeIn ? 'grey400' : 'black'}
                          >
                            {formatMessage(messages.duplicateAnotherSurvey)}
                          </Text>
                        </DropdownListItem>
                        <UpsellTooltip
                          disabled={importPrintedFormsAllowed}
                          // Needed to ensure DropdownListItem takes up the full width of the dropdown
                          width="100%"
                        >
                          <DropdownListItem
                            onClick={handleDownloadPDF}
                            disabled={!importPrintedFormsAllowed}
                          >
                            <Icon
                              name="download"
                              fill={colors.coolGrey600}
                              mr="4px"
                            />
                            {formatMessage(messages.downloadSurvey)}
                          </DropdownListItem>
                        </UpsellTooltip>
                        <UpsellTooltip
                          disabled={inputImporterAllowed}
                          // Needed to ensure DropdownListItem takes up the full width of the dropdown
                          width="100%"
                        >
                          <DropdownListItem
                            onClick={downloadExampleFile}
                            disabled={!inputImporterAllowed}
                          >
                            <Icon
                              name="download"
                              fill={colors.coolGrey600}
                              mr="4px"
                            />
                            {formatMessage(messages.downloadExcelTemplate)}
                            <IconTooltip
                              ml="4px"
                              content={formatMessage(
                                messages.downloadExcelTemplateTooltip
                              )}
                            />
                          </DropdownListItem>
                        </UpsellTooltip>
                      </>
                    )}
                    <DropdownListItem
                      onClick={handleDownloadResults}
                      data-cy="e2e-download-survey-results"
                    >
                      <Icon
                        name="download"
                        fill={colors.coolGrey600}
                        mr="4px"
                      />
                      <Text my="0px">
                        {formatMessage(messages.downloadResults)}
                      </Text>
                    </DropdownListItem>
                    {haveSubmissionsComeIn && (
                      <DropdownListItem
                        onClick={openDeleteModal}
                        data-cy="e2e-delete-survey-results"
                      >
                        <Icon name="delete" fill={colors.red600} mr="4px" />
                        <Text color="red600" my="0px">
                          {formatMessage(messages.deleteSurveyResults)}
                        </Text>
                      </DropdownListItem>
                    )}
                  </>
                }
              />
            </Box>
          </Box>
        </Box>
        <FormResults />
        <EditWarningModal
          editFormLink={editFormLink}
          showEditWarningModal={showEditWarningModal}
          setShowEditWarningModal={setShowEditWarningModal}
          handleDownloadResults={handleDownloadResults}
        />
        <CopySurveyModal
          editFormLink={editFormLink}
          showCopySurveyModal={showCopySurveyModal}
          setShowCopySurveyModal={setShowCopySurveyModal}
          surveyFormPersisted={surveyFormPersisted}
        />
      </Box>
      <PDFExportModal
        open={exportModalOpen}
        formType="survey"
        onClose={() => setExportModalOpen(false)}
        onExport={handleExportPDF}
      />
      <Modal opened={showDeleteModal} close={closeDeleteModal}>
        <Box display="flex" flexDirection="column" width="100%" p="20px">
          <Box mb="40px">
            <Title variant="h3" color="primary">
              {formatMessage(messages.deleteResultsConfirmationQuestion)}
            </Title>
            <Text color="primary" fontSize="l">
              {formatMessage(messages.deleteResultsInfo)}
            </Text>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            width="100%"
            alignItems="center"
          >
            <Button
              icon="delete"
              data-cy="e2e-confirm-delete-survey-results"
              buttonStyle="delete"
              width="auto"
              mr="20px"
              onClick={deleteResults}
            >
              {formatMessage(messages.confirmDeleteButtonText)}
            </Button>
            <Button
              buttonStyle="secondary-outlined"
              width="auto"
              onClick={closeDeleteModal}
            >
              {formatMessage(messages.cancelDeleteButtonText)}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default Forms;
