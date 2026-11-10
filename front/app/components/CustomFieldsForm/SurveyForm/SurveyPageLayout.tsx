import React from 'react';

import {
  Box,
  stylingConsts,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';
import { IMapConfig } from 'api/map_config/types';
import { IPhaseData, IPhases } from 'api/phases/types';
import { IProject } from 'api/projects/types';

import PageEsriMap from '../Map/PageEsriMap';
import PageTransition, { PageDirection } from '../Page/PageTransition';
import PreviousPageButton from '../Page/PreviousPageButton';
import PageControlButtons from '../PageControlButtons';

export type SurveyPageMap = {
  mapConfig: IMapConfig | null | undefined;
  mapLayers: __esri.Layer[];
};

export type SurveyPageControls = {
  variant: 'other' | 'submission' | 'after-submission';
  hasPreviousPage: boolean;
  handleNextAndSubmit: () => void;
  handlePrevious: () => void;
  isLoading: boolean;
  phase: IPhaseData | undefined;
  phases: IPhases | undefined;
  project: IProject | undefined;
  pageButtonLabelMultiloc?: Multiloc;
  pageButtonLink?: string;
  pageQuestions: IFlatCustomField[];
};

type Props = {
  currentPageIndex: number;
  // A map page: the map next to the page (above it on phones). Give the
  // surrounding FormPageLayout `wide` for the room.
  map?: SurveyPageMap;
  showPreviousButton: boolean;
  controls: SurveyPageControls;
  // Above the page, e.g. the form's error feedback.
  feedback?: React.ReactNode;
  // The page title and description.
  header: React.ReactNode;
  // The questions, spaced with FORM_QUESTION_SPACING.
  questions: React.ReactNode;
  // After the questions, e.g. the submission reference.
  afterQuestions?: React.ReactNode;
  submitConfirmation?: React.ReactNode;
  // The element that scrolls the page content back up on navigation.
  pageRef?: React.RefObject<HTMLDivElement>;
  enterDirection: PageDirection;
  // Shows the buttons without letting them be used (the survey builder's
  // preview).
  inertControls?: boolean;
};

const setInert = (element: HTMLElement | null) => {
  element?.setAttribute('inert', '');
};

// One survey page as participants see it, used by the survey itself and by
// the survey builder's preview, so both always look the same. The caller
// fills in the content: the survey with the real questions, the builder with
// editable ones. Map pages are laid out like any other page, with the map
// next to the content, staying in view while the page scrolls.
// The progress card (ProgressFooter) isn't part of it: the caller renders it
// once, around all pages, so it stays put (and animates) across page changes.
const SurveyPageLayout = ({
  currentPageIndex,
  map,
  showPreviousButton,
  controls,
  feedback,
  header,
  questions,
  afterQuestions,
  submitConfirmation,
  pageRef,
  enterDirection,
  inertControls = false,
}: Props) => {
  const isPhone = useBreakpoint('phone');
  const wrapControls = (node: React.ReactNode) =>
    inertControls ? (
      <Box ref={setInert} pointerEvents="none" aria-hidden>
        {node}
      </Box>
    ) : (
      node
    );

  const page = (
    <Box ref={pageRef}>
      {showPreviousButton &&
        wrapControls(<PreviousPageButton onClick={controls.handlePrevious} />)}
      {feedback}
      {header}
      {questions}
      {afterQuestions}
      {submitConfirmation}
      {wrapControls(
        <PageControlButtons
          inline
          showPrevious={false}
          handleNextAndSubmit={controls.handleNextAndSubmit}
          handlePrevious={controls.handlePrevious}
          hasPreviousPage={controls.hasPreviousPage}
          isLoading={controls.isLoading}
          pageVariant={controls.variant}
          phases={controls.phases?.data}
          currentPhase={controls.phase}
          pageButtonLabelMultiloc={controls.pageButtonLabelMultiloc}
          pageButtonLink={controls.pageButtonLink}
          project={controls.project}
          pageQuestions={controls.pageQuestions}
          currentPageIndex={currentPageIndex}
        />
      )}
    </Box>
  );

  const mapElement = map && (
    <PageEsriMap
      variant="block"
      currentPageIndex={currentPageIndex}
      mapConfig={map.mapConfig}
      mapLayers={map.mapLayers}
    />
  );

  return (
    <Box
      id="container"
      w="100%"
      // Room for the progress card floating at the bottom.
      pb="80px"
      data-cy={`e2e-page-number-${currentPageIndex + 1}`}
    >
      <PageTransition direction={enterDirection}>
        {!mapElement ? (
          page
        ) : isPhone ? (
          <>
            <Box h="320px" mb="40px">
              {mapElement}
            </Box>
            {page}
          </>
        ) : (
          <Box display="flex" alignItems="flex-start" gap="40px">
            {/* Stays in view below the sticky heading bar while the page
                scrolls, clear of the progress card at the bottom. */}
            <Box
              flex="3 1 0"
              minWidth="0px"
              position="sticky"
              top={`${stylingConsts.menuHeight + 24}px`}
              h={`calc(100vh - ${stylingConsts.menuHeight}px - 128px)`}
              minHeight="320px"
            >
              {mapElement}
            </Box>
            <Box flex="2 1 0" minWidth="360px">
              {page}
            </Box>
          </Box>
        )}
      </PageTransition>
    </Box>
  );
};

export default SurveyPageLayout;
