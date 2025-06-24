import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { IPhaseData, IPhases } from 'api/phases/types';
import { IProject } from 'api/projects/types';

import PageControlButtons from 'components/Form/Components/Layouts/PageControlButtons';

import ProgressBar from '../ProgressBar';

const PageFooter = ({
  variant,
  hasPreviousPage,
  handleNextAndSubmit,
  handlePrevious,
  formCompletionPercentage,
  pageButtonLabelMultiloc,
  phase,
  project,
  phases,
  isLoading,
  isAdminPage,
  isMapPage,
}: {
  variant: 'other' | 'after-submission' | 'submission';
  hasPreviousPage: boolean;
  handleNextAndSubmit: () => void;
  handlePrevious: () => void;
  formCompletionPercentage: number;
  pageButtonLabelMultiloc?: Multiloc;
  phase?: IPhaseData;
  project?: IProject;
  phases?: IPhases;
  isLoading: boolean;
  isAdminPage?: boolean;
  isMapPage?: boolean;
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
          project={project}
        />
      </Box>
    </Box>
  );
};

export default PageFooter;
