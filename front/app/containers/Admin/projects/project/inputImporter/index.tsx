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

import { IJobData } from 'api/jobs/types';
import useJobs from 'api/jobs/useJobs';

import useFeatureFlag from 'hooks/useFeatureFlag';
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

  const [importJobs, setImportJobs] = useState<IJobData[]>([]);
  const importJobIds = importJobs.map((job) => job.attributes.job_id);
  const { data: jobs } = useJobs(importJobIds);

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
            <ReviewSection
              pollIdeas={!!jobs?.data.some((job) => job.attributes.active)}
            />
          </Box>
        </FocusOn>
      </Box>
      <ImportExcelModal
        open={importExcelModalOpen}
        onClose={closeImportExcelModal}
      />
      <ImportPdfModal
        open={importPdfModalOpen}
        onClose={closeImportPdfModal}
        onImport={(jobs: IJobData[]) => setImportJobs(jobs)}
      />
    </>
  );
};

const InputImporterWrapper = () => {
  const inputImporterEnabled = useFeatureFlag({
    name: 'input_importer',
  });
  if (!inputImporterEnabled) return null;

  const modalPortalElement = document.getElementById('modal-portal');
  if (!modalPortalElement) return null;

  return createPortal(<InputImporter />, modalPortalElement);
};

export default InputImporterWrapper;
