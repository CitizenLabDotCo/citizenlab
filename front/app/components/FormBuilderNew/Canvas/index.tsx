import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { useDragLayer, useDrop } from 'react-dnd';
import { FormProvider, useForm } from 'react-hook-form';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import CustomFields from 'components/CustomFieldsForm/CustomFields';
import CustomFieldsSignupHelperText from 'components/CustomFieldsForm/CustomFieldsSignupHelperText';
import useEsriMapPage from 'components/CustomFieldsForm/Map/useEsriMapPage';
import FormPageLayout from 'components/CustomFieldsForm/Page/FormPageLayout';
import PageTitle from 'components/CustomFieldsForm/Page/PageTitle';
import { usePageDirection } from 'components/CustomFieldsForm/Page/PageTransition';
import ProgressFooter from 'components/CustomFieldsForm/Page/ProgressFooter';
import SurveyHeadingBar from 'components/CustomFieldsForm/Page/SurveyHeadingBar';
import SurveyPageLayout, {
  getQuestionSpacing,
  SurveyPageLayoutVariant,
} from 'components/CustomFieldsForm/SurveyForm/SurveyPageLayout';

import { useIntl } from 'utils/cl-intl';

import { DND_QUESTION, DragItem, useBuilder } from '../context';
import messages from '../messages';
import {
  getDisplayGroups,
  getPageGroups,
  isFormEndPage,
  isUserPage,
} from '../utils';

import InsertionPoint from './InsertionPoint';
import PageHeaderBlock from './PageHeaderBlock';
import QuestionBlock, { EmptyBlockHint } from './QuestionBlock';

const noop = () => {};

const setInert = (element: HTMLElement | null) => {
  element?.setAttribute('inert', '');
};

type Props = {
  phase: IPhaseData;
  projectId: string;
  // Rendered above the survey, e.g. save status and warnings.
  top?: React.ReactNode;
};

// Renders the open page with the same components as the participant survey
// (FormPageLayout and SurveyPageLayout), so the two always look the same.
// Only the content differs: editable header and question blocks.
const Canvas = ({ phase, projectId, top }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const {
    fields,
    userPage,
    currentPageId,
    setDropTarget,
    dropQuestion,
    openAddModal,
  } = useBuilder();

  // The question previews need a form of their own to register their inputs
  // in; it's never submitted.
  const previewMethods = useForm();

  const isDraggingQuestion = useDragLayer(
    (monitor) => monitor.isDragging() && monitor.getItemType() === DND_QUESTION
  );

  const groups = getDisplayGroups(getPageGroups(fields), userPage);
  const currentIndex = Math.max(
    0,
    groups.findIndex((group) => group.page.id === currentPageId)
  );
  // Next pages slide in from the right, previous ones from the left.
  const enterDirection = usePageDirection(currentIndex);
  const group = groups[currentIndex] as (typeof groups)[number] | undefined;
  const isEndPage = group ? isFormEndPage(group.page) : false;
  const isDemographicsPage = group ? isUserPage(group.page) : false;
  // Nothing can be added to or dropped on these pages.
  const isLocked = isEndPage || isDemographicsPage;
  const isMapPage = group?.page.page_layout === 'map';
  const layout: SurveyPageLayoutVariant = isMapPage ? 'classic' : 'regular';
  const questionSpacing = getQuestionSpacing(layout);
  const { mapConfig, mapLayers, draggableDivRef, dragDividerRef } =
    useEsriMapPage({
      project,
      pages: groups,
      currentPageIndex: currentIndex,
      localize,
    });

  // Hovering anywhere around the questions targets the end of the page;
  // the blocks and gaps inside narrow that down. All drops land here.
  const [, drop] = useDrop<DragItem>({
    accept: DND_QUESTION,
    canDrop: () => !!group && !isLocked,
    hover: (_item, monitor) => {
      if (!group || isLocked || !monitor.isOver({ shallow: true })) return;
      setDropTarget({
        pageId: group.page.id,
        index: group.questions.length,
      });
    },
    drop: (item) => {
      dropQuestion(item.id);
    },
  });

  if (!group) return null;

  const lastIndex = groups.length - 1;
  const visibleQuestions = group.questions.filter(
    ({ field }) => field.enabled !== false
  );
  const isEnding = currentIndex === lastIndex;

  const header = isDemographicsPage ? (
    // Shown as participants see it; the questions come from the access
    // rights settings and can't be edited here.
    <Box ref={setInert} pointerEvents="none" aria-hidden>
      <PageTitle page={group.page} />
      <CustomFieldsSignupHelperText />
    </Box>
  ) : (
    <PageHeaderBlock page={group.page} />
  );

  const questions = (
    <FormProvider {...previewMethods}>
      {isDemographicsPage && (
        <Box ref={setInert} pointerEvents="none" aria-hidden>
          <CustomFields
            questions={visibleQuestions.map(({ field }) => field)}
            projectId={projectId}
            phase={phase}
            participationMethod={phase.attributes.participation_method}
            scrollErrorIntoView={false}
            questionSpacing={questionSpacing}
          />
        </Box>
      )}

      {!isLocked &&
        (visibleQuestions.length === 0 ? (
          <Box
            onClick={() => openAddModal({ pageId: group.page.id, index: 0 })}
            style={{ cursor: 'pointer' }}
          >
            <EmptyBlockHint>
              <Text color="textSecondary" m="0px">
                {formatMessage(messages.emptyPage)}
              </Text>
            </EmptyBlockHint>
          </Box>
        ) : (
          <>
            <InsertionPoint
              pageId={group.page.id}
              index={0}
              isDraggingQuestion={isDraggingQuestion}
            />
            {group.questions.map(({ field }, position) =>
              field.enabled === false ? null : (
                <React.Fragment key={field.id}>
                  <QuestionBlock
                    question={field}
                    pageId={group.page.id}
                    position={position}
                    projectId={projectId}
                    phase={phase}
                    questionSpacing={questionSpacing}
                  />
                  <InsertionPoint
                    pageId={group.page.id}
                    index={position + 1}
                    isDraggingQuestion={isDraggingQuestion}
                    questionSpacing={questionSpacing}
                  />
                </React.Fragment>
              )
            )}
          </>
        ))}
    </FormProvider>
  );

  return (
    <Box
      ref={drop}
      flex="1"
      minWidth="0px"
      h="100vh"
      data-cy="e2e-form-builder-new-canvas"
    >
      <FormPageLayout
        embedded
        usingMapView={layout === 'classic'}
        mainId="e2e-form-builder-new-preview"
        heading={
          <SurveyHeadingBar
            titleText={localize(phase.attributes.native_survey_title_multiloc)}
            bordered={layout === 'classic'}
            actions={<Icon name="close" fill={colors.textSecondary} />}
          />
        }
      >
        <Box w="100%">
          <SurveyPageLayout
            // A new page remounts, so it slides in like for participants.
            key={group.page.id}
            layout={layout}
            currentPageIndex={currentIndex}
            map={
              isMapPage
                ? { mapConfig, mapLayers, draggableDivRef, dragDividerRef }
                : undefined
            }
            showPreviousButton={currentIndex > 0 && !isEnding}
            controls={{
              variant: isEnding
                ? 'after-submission'
                : currentIndex + 1 === lastIndex
                ? 'submission'
                : 'other',
              hasPreviousPage: currentIndex > 0,
              handleNextAndSubmit: noop,
              handlePrevious: noop,
              isLoading: false,
              phase,
              phases,
              project,
              pageButtonLabelMultiloc: group.page.page_button_label_multiloc,
              pageButtonLink: group.page.page_button_link,
              pageQuestions: visibleQuestions.map(({ field }) => field),
            }}
            feedback={top}
            header={header}
            questions={questions}
            enterDirection={enterDirection}
            inertControls
          />
          {/* Outside the page, like in the survey, so it stays put across
              pages. Not usable here: its language switcher would change the
              admin's own language. */}
          <Box ref={setInert} pointerEvents="none" aria-hidden>
            <ProgressFooter
              formCompletionPercentage={
                lastIndex > 0 ? Math.round((currentIndex / lastIndex) * 100) : 0
              }
              currentPage={currentIndex + 1}
              totalPages={lastIndex}
            />
          </Box>
        </Box>
      </FormPageLayout>
    </Box>
  );
};

export default Canvas;
