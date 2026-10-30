import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import usePhase from 'api/phases/usePhase';
import useSubmissionCount from 'api/submission_count/useSubmissionCount';

import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';
import ImportExcelModal from 'containers/Admin/projects/project/inputImporter/ImportModal/ImportExcelModal';
import ImportPdfModal from 'containers/Admin/projects/project/inputImporter/ImportModal/ImportPdfModal';
import { isPDFUploadSupported } from 'containers/Admin/projects/project/inputImporter/ReviewSection/utils';
import CopySurveyModal from 'containers/Admin/projects/project/surveyFormAssets/CopySurveyModal';

import ImportInputsSection from 'components/admin/FormSync/ImportInputsSection';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../../messages';

import NavCard from './NavCard';

interface Props {
  projectId: string;
  phaseId: string;
  hasQuestions: boolean;
  opened: boolean;
  onClose: () => void;
}

const SurveySetupModal = ({
  projectId,
  phaseId,
  hasQuestions,
  opened,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();
  const [copyOpened, setCopyOpened] = useState(false);
  const [upload, setUpload] = useState<'pdf' | 'excel' | null>(null);
  const { data: phase } = usePhase(phaseId);
  const { data: submissionCount } = useSubmissionCount({ phaseId });
  const editFormLink = `/admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`;
  // Copying replaces the questions, which would orphan existing responses.
  const canCopy = submissionCount?.data.attributes.totalSubmissions === 0;

  // The upload replaces this modal.
  const openUpload = (format: 'pdf' | 'excel') => {
    onClose();
    setUpload(format);
  };

  // Imported responses wait for review on the importer page.
  const goToReview = () =>
    clHistory.push(
      `/admin/projects/${projectId}/phases/${phaseId}/input-importer`
    );

  return (
    <>
      <Modal
        opened={opened}
        close={onClose}
        width="720px"
        header={formatMessage(
          hasQuestions ? messages.surveyForm : messages.addQuestions
        )}
      >
        <Box p="24px" display="flex" flexDirection="column" gap="10px">
          <Text variant="boHelper" m="0 0 6px">
            {formatMessage(messages.surveySetupLead)}
          </Text>
          <NavCard
            label={formatMessage(
              hasQuestions ? messages.editForm : messages.startFromScratch
            )}
            onClick={() => {
              onClose();
              clHistory.push(editFormLink);
            }}
          />
          {canCopy && (
            <NavCard
              label={formatMessage(messages.usePreviousSurvey)}
              tooltip={formatMessage(messages.usePreviousSurveyTooltip)}
              onClick={() => {
                onClose();
                setCopyOpened(true);
              }}
            />
          )}
          <PanelGroup label={formatMessage(messages.importResponses)}>
            <ImportInputsSection
              formType="survey"
              pdfImportSupported={isPDFUploadSupported('native_survey')}
              onClickPDFImport={() => openUpload('pdf')}
              onClickExcelImport={() => openUpload('excel')}
            />
          </PanelGroup>
        </Box>
      </Modal>
      <CopySurveyModal
        editFormLink={editFormLink}
        showCopySurveyModal={copyOpened}
        setShowCopySurveyModal={setCopyOpened}
        surveyFormPersisted={!!phase?.data.attributes.custom_form_persisted}
      />
      <ImportPdfModal
        open={upload === 'pdf'}
        onClose={() => setUpload(null)}
        onUploaded={goToReview}
      />
      <ImportExcelModal
        projectId={projectId}
        phaseId={phaseId}
        open={upload === 'excel'}
        onClose={() => setUpload(null)}
        onUploaded={goToReview}
      />
    </>
  );
};

export default SurveySetupModal;
