import React, { useState } from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';

import { useParams } from 'utils/router';

import ImportExcelModal from './ImportModal/ImportExcelModal';
import ImportPdfModal from './ImportModal/ImportPdfModal';
import ReviewSection from './ReviewSection';
import TopBar from './TopBar';

const InputImporter = () => {
  const { projectId, phaseId } = useParams({
    from: '/$locale/admin/projects/$projectId/phases/$phaseId/input-importer',
  });
  const [importPdfModalOpen, setImportPdfModalOpen] = useState(false);
  const [importExcelModalOpen, setImportExcelModalOpen] = useState(false);

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
            <ReviewSection
              onClickPDFImport={openImportPdfModal}
              onClickExcelImport={openImportExcelModal}
            />
          </Box>
        </FocusOn>
      </Box>
      <ImportExcelModal
        projectId={projectId}
        phaseId={phaseId}
        open={importExcelModalOpen}
        onClose={closeImportExcelModal}
      />
      <ImportPdfModal open={importPdfModalOpen} onClose={closeImportPdfModal} />
    </>
  );
};

const InputImporterWrapper = () => {
  const modalPortalElement = document.getElementById('modal-portal');
  if (!modalPortalElement) return null;

  return createPortal(<InputImporter />, modalPortalElement);
};

export default InputImporterWrapper;
