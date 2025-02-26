import React, { useState } from 'react';

import {
  Box,
  Spinner,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import { useParams } from 'react-router-dom';

import { IBackgroundJobData } from 'api/background_jobs/types';

import useInputSchema from 'hooks/useInputSchema';

import ImportExcelModal from './ImportModal/ImportExcelModal';
import ImportPdfModal from './ImportModal/ImportPdfModal';
import ReviewSection from './ReviewSection';
import TopBar from './TopBar';

const InputImporter = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };

  const [importPdfModalOpen, setImportPdfModalOpen] = useState(false);
  const [importExcelModalOpen, setImportExcelModalOpen] = useState(false);

  const [importJobs, setImportJobs] = useState<IBackgroundJobData[]>([]);

  const { schema, uiSchema } = useInputSchema({
    projectId,
    phaseId,
  });

  if (!schema || !uiSchema) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        w="100%"
        zIndex="10000"
        position="fixed"
        bgColor={colors.background}
        h="100vh"
      >
        <Spinner />
      </Box>
    );
  }

  const openImportPdfModal = () => setImportPdfModalOpen(true);
  const closeImportPdfModal = () => setImportPdfModalOpen(false);

  const openImportExcelModal = () => setImportExcelModalOpen(true);
  const closeImportExcelModal = () => setImportExcelModalOpen(false);

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        w="100%"
        zIndex="10000"
        position="fixed"
        bgColor={colors.background}
        h="100vh"
      >
        <FocusOn>
          <TopBar
            onClickPDFImport={openImportPdfModal}
            onClickExcelImport={openImportExcelModal}
          />
          <Box
            mt={`${stylingConsts.mobileMenuHeight}px`}
            h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px)`}
          >
            <ReviewSection importJobs={importJobs} />
          </Box>
        </FocusOn>
      </Box>
      <ImportExcelModal
        open={importExcelModalOpen}
        onClose={closeImportExcelModal}
        onImport={(jobs: IBackgroundJobData[]) => setImportJobs(jobs)}
      />
      <ImportPdfModal
        open={importPdfModalOpen}
        onClose={closeImportPdfModal}
        onImport={(jobs: IBackgroundJobData[]) => setImportJobs(jobs)}
      />
    </>
  );
};

const InputImporterWrapper = () => {
  const modalPortalElement = document.getElementById('modal-portal');
  if (!modalPortalElement) return null;

  return createPortal(<InputImporter />, modalPortalElement);
};

export default InputImporterWrapper;
