import React, { useState } from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';

import { IBackgroundJobData } from 'api/background_jobs/types';

import ImportExcelModal from './ImportModal/ImportExcelModal';
import ImportPdfModal from './ImportModal/ImportPdfModal';
import ReviewSection from './ReviewSection';
import TopBar from './TopBar';

const InputImporter = () => {
  const [importPdfModalOpen, setImportPdfModalOpen] = useState(false);
  const [importExcelModalOpen, setImportExcelModalOpen] = useState(false);

  const [importJobs, setImportJobs] = useState<IBackgroundJobData[]>([]);

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
