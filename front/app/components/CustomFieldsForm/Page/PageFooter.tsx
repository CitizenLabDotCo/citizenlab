import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';
import { IPhaseData, IPhases } from 'api/phases/types';
import { IProject } from 'api/projects/types';

import PageControlButtons from '../PageControlButtons';
import ProgressBar from '../ProgressBar';

const PageFooter = ({
  variant,
  hasPreviousPage,
  handleNextAndSubmit,
  handlePrevious,
  formCompletionPercentage,
  pageButtonLabelMultiloc,
  pageButtonLink,
  phase,
  project,
  phases,
  isLoading,
  isAdminPage,
  isMapPage,
  pageQuestions,
  currentPageIndex,
}: {
  variant: 'other' | 'after-submission' | 'submission';
  hasPreviousPage: boolean;
  handleNextAndSubmit: () => void;
  handlePrevious: () => void;
  formCompletionPercentage: number;
  pageButtonLabelMultiloc?: Multiloc;
  pageButtonLink?: string;
  phase?: IPhaseData;
  project?: IProject;
  phases?: IPhases;
  isLoading: boolean;
  isAdminPage?: boolean;
  isMapPage?: boolean;
  pageQuestions?: IFlatCustomField[];
  currentPageIndex?: number;
}) => {
  const isMobileOrSmaller = useBreakpoint('phone');
  return (
    <Box
      maxWidth={!isAdminPage ? (isMapPage ? '1100px' : '700px') : undefined}
      w="100%"
      position="fixed"
      bottom={isMobileOrSmaller || isAdminPage ? '0' : '40px'}
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <ProgressBar formCompletionPercentage={formCompletionPercentage} />

      <Box w="100%">
        <PageControlButtons
          handleNextAndSubmit={handleNextAndSubmit}
          handlePrevious={handlePrevious}
          hasPreviousPage={hasPreviousPage}
          isLoading={isLoading}
          pageVariant={variant}
          phases={phases?.data}
          currentPhase={phase}
          pageButtonLabelMultiloc={pageButtonLabelMultiloc}
          pageButtonLink={pageButtonLink}
          project={project}
          pageQuestions={pageQuestions}
          currentPageIndex={currentPageIndex}
        />
      </Box>
    </Box>
  );
};

export default PageFooter;
