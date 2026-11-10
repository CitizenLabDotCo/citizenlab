import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';
import { IMapConfig } from 'api/map_config/types';
import { IPhaseData, IPhases } from 'api/phases/types';
import { IProject } from 'api/projects/types';

import PageEsriDivider from '../Map/PageEsriDivider';
import PageEsriMap from '../Map/PageEsriMap';
import {
  FORM_QUESTION_SPACING,
  MAP_VIEW_QUESTION_SPACING,
} from '../Page/FormPageLayout';
import PageTransition, { PageDirection } from '../Page/PageTransition';
import PreviousPageButton from '../Page/PreviousPageButton';
import PageControlButtons from '../PageControlButtons';

// 'regular' flows with the page; 'classic' is a card of a fixed height with
// its own scroll (map pages, admin previews).
export type SurveyPageLayoutVariant = 'regular' | 'classic';

export const getQuestionSpacing = (layout: SurveyPageLayoutVariant) =>
  layout === 'classic' ? MAP_VIEW_QUESTION_SPACING : FORM_QUESTION_SPACING;

export type SurveyPageMap = {
  mapConfig: IMapConfig | null | undefined;
  mapLayers: __esri.Layer[];
  draggableDivRef: React.RefObject<HTMLDivElement>;
  dragDividerRef: React.RefObject<HTMLDivElement>;
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
  layout: SurveyPageLayoutVariant;
  currentPageIndex: number;
  // Shown next to the page (classic layout only).
  map?: SurveyPageMap;
  // The Previous button above the page (regular layout only; in the classic
  // layout it's next to the other buttons).
  showPreviousButton: boolean;
  controls: SurveyPageControls;
  // Above the page, e.g. the form's error feedback.
  feedback?: React.ReactNode;
  // The page title and description.
  header: React.ReactNode;
  // The questions, spaced with getQuestionSpacing(layout).
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
// editable ones.
// The progress card (ProgressFooter) isn't part of it: the caller renders it
// once, around all pages, so it stays put (and animates) across page changes
// and layouts.
const SurveyPageLayout = ({
  layout,
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
  const isMobileOrSmaller = useBreakpoint('phone');

  const wrapControls = (node: React.ReactNode) =>
    inertControls ? (
      <Box ref={setInert} pointerEvents="none" aria-hidden>
        {node}
      </Box>
    ) : (
      node
    );

  // At the end of the page content in both layouts.
  const buttons = wrapControls(
    <PageControlButtons
      inline
      showPrevious={layout === 'classic'}
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
  );

  if (layout === 'regular') {
    return (
      <Box
        id="container"
        w="100%"
        // Room for the progress card floating at the bottom.
        pb="80px"
        data-cy={`e2e-page-number-${currentPageIndex + 1}`}
      >
        <PageTransition direction={enterDirection}>
          <Box ref={pageRef}>
            {showPreviousButton &&
              wrapControls(
                <PreviousPageButton onClick={controls.handlePrevious} />
              )}
            {feedback}
            {header}
            {questions}
            {afterQuestions}
            {submitConfirmation}
            {buttons}
          </Box>
        </PageTransition>
      </Box>
    );
  }

  return (
    <Box
      id="container"
      display="flex"
      flexDirection={isMobileOrSmaller ? 'column' : 'row'}
      height="100%"
      w="100%"
      data-cy={`e2e-page-number-${currentPageIndex + 1}`}
    >
      {map && (
        <PageEsriMap
          currentPageIndex={currentPageIndex}
          mapConfig={map.mapConfig}
          mapLayers={map.mapLayers}
          draggableDivRef={map.draggableDivRef}
        />
      )}
      <Box
        flex={'1 1 auto'}
        h={map && isMobileOrSmaller ? '80%' : '100%'}
        position="relative"
        overflow="hidden"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box
          display="flex"
          flexDirection="column"
          height="100%"
          overflowY="auto"
          overflowX="hidden"
          ref={pageRef}
        >
          {feedback}

          {map && isMobileOrSmaller && (
            <PageEsriDivider dragDividerRef={map.dragDividerRef} />
          )}
          <Box
            h="100%"
            display="flex"
            flexDirection="column"
            mt={map && isMobileOrSmaller ? '20px' : undefined}
            mb="40px"
          >
            <Box h="100%" display="flex" flexDirection="column">
              {/* Only the page content slides in; the map stays put. */}
              <PageTransition direction={enterDirection}>
                <Box p="24px" w="100%">
                  <Box display="flex" flexDirection="column">
                    {header}
                    {questions}
                    {afterQuestions}
                    {buttons}
                  </Box>
                </Box>
              </PageTransition>
            </Box>
          </Box>
        </Box>
        {submitConfirmation}
      </Box>
    </Box>
  );
};

export default SurveyPageLayout;
