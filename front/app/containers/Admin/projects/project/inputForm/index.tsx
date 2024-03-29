import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { saveAs } from 'file-saver';
import { useParams } from 'react-router-dom';

import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import PDFExportModal, {
  FormValues,
} from 'containers/Admin/projects/components/PDFExportModal';
import { API_PATH } from 'containers/App/constants';

import { SectionTitle, SectionDescription } from 'components/admin/Section';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { requestBlob } from 'utils/requestBlob';

import messages from './messages';
import { saveIdeaFormAsPDF } from './saveIdeaFormAsPDF';

export const IdeaForm = () => {
  const printedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const { projectId } = useParams() as {
    projectId: string;
  };

  const locale = useLocale();
  const { data: phases } = usePhases(projectId);

  const phaseToUse = phases ? getCurrentOrLastIdeationPhase(phases.data) : null;

  const handleDownloadPDF = () => setExportModalOpen(true);

  const handleExportPDF = async ({ personal_data, phase_id }: FormValues) => {
    if (isNilOrError(locale)) return;
    await saveIdeaFormAsPDF({ projectId, locale, personal_data, phase_id });
  };

  const downloadExampleFile = async () => {
    const blob = await requestBlob(
      `${API_PATH}/projects/${projectId}/import_ideas/example_xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    saveAs(blob, 'example.xlsx');
  };

  return (
    <>
      <Box gap="0px" flexWrap="wrap" width="100%" display="flex">
        <Box width="100%">
          <SectionTitle>
            <FormattedMessage {...messages.inputForm} />
          </SectionTitle>
          <SectionDescription style={{ maxWidth: '700px' }}>
            <FormattedMessage {...messages.inputFormDescription} />
          </SectionDescription>
        </Box>
        <Box display="flex" flexDirection="row">
          <Button
            linkTo={`/admin/projects/${projectId}/phases/${phaseToUse?.id}/ideaform/edit`}
            width="auto"
            icon="edit"
            data-cy="e2e-edit-input-form"
          >
            <FormattedMessage {...messages.editInputForm} />
          </Button>
          {printedFormsEnabled && (
            <>
              <Box m="8px">
                <Button
                  onClick={handleDownloadPDF}
                  width="auto"
                  icon="download"
                  data-cy="e2e-save-input-form-pdf"
                >
                  <FormattedMessage {...messages.downloadInputForm} />
                </Button>
              </Box>
              <Button
                buttonStyle="secondary"
                icon="download"
                onClick={downloadExampleFile}
              >
                <FormattedMessage {...messages.downloadExcelTemplate} />
              </Button>
            </>
          )}
        </Box>
      </Box>
      <PDFExportModal
        open={exportModalOpen}
        formType="idea_form"
        onClose={() => setExportModalOpen(false)}
        onExport={handleExportPDF}
      />
    </>
  );
};

const isIdeationContext = (
  participationContext: ParticipationMethod | undefined
) => {
  return (
    participationContext === 'ideation' || participationContext === 'voting'
  );
};

const getCurrentOrLastIdeationPhase = (phases: IPhaseData[]) => {
  const currentPhase = getCurrentPhase(phases);
  if (isIdeationContext(currentPhase?.attributes.participation_method)) {
    return currentPhase;
  }
  const ideationPhases = phases.filter((phase) =>
    isIdeationContext(phase.attributes.participation_method)
  );
  if (ideationPhases.length > 0) {
    return ideationPhases.pop();
  }
  return undefined;
};

export default IdeaForm;
