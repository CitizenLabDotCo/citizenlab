import React from 'react';

import {
  Box,
  colors,
  Icon,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';
import { useDragLayer, useDrop } from 'react-dnd';
import { FormProvider, useForm } from 'react-hook-form';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import CustomFields from 'components/CustomFieldsForm/CustomFields';
import CustomFieldsSignupHelperText from 'components/CustomFieldsForm/CustomFieldsSignupHelperText';
import {
  FORM_CONTENT_MAX_WIDTH,
  FORM_QUESTION_SPACING,
} from 'components/CustomFieldsForm/Page/FormPageLayout';
import PageTitle from 'components/CustomFieldsForm/Page/PageTitle';
import PreviousPageButton from 'components/CustomFieldsForm/Page/PreviousPageButton';
import ProgressFooter from 'components/CustomFieldsForm/Page/ProgressFooter';
import PageControlButtons from 'components/CustomFieldsForm/PageControlButtons';

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

// Renders the open page the way participants see it on the survey page
// (heading bar, white card, page title, questions, progress bar and buttons),
// with editing affordances layered on top.
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
  const group = groups[currentIndex] as (typeof groups)[number] | undefined;
  const isEndPage = group ? isFormEndPage(group.page) : false;
  const isDemographicsPage = group ? isUserPage(group.page) : false;
  // Nothing can be added to or dropped on these pages.
  const isLocked = isEndPage || isDemographicsPage;

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
  const nextIsLast = currentIndex + 1 === lastIndex;
  const visibleQuestions = group.questions.filter(
    ({ field }) => field.enabled !== false
  );

  const isEnding = currentIndex === lastIndex;
  const pageVariant = isEnding
    ? 'after-submission'
    : nextIsLast
    ? 'submission'
    : 'other';

  // Same layout as the participant survey page: white page, sticky heading
  // bar, the page in a centred column, buttons at the end of the content and
  // the progress bar along the bottom.
  return (
    <Box
      ref={drop}
      flex="1"
      h="100vh"
      overflowY="auto"
      bgColor={colors.grey100}
      display="flex"
      flexDirection="column"
      data-cy="e2e-form-builder-new-canvas"
    >
      <Box
        position="sticky"
        top="0"
        zIndex="3"
        bgColor={colors.white}
        borderBottom={`1px solid ${colors.divider}`}
      >
        <Box
          maxWidth={FORM_CONTENT_MAX_WIDTH}
          mx="auto"
          display="flex"
          alignItems="center"
          minHeight={`${stylingConsts.menuHeight}px`}
          px="24px"
        >
          <Text color="tenantText" fontSize="m" my="0px">
            {localize(phase.attributes.native_survey_title_multiloc)}
          </Text>
          <Box ml="auto" display="flex">
            <Icon name="close" fill={colors.textSecondary} />
          </Box>
        </Box>
      </Box>

      <Box
        flex="1"
        w="100%"
        maxWidth={FORM_CONTENT_MAX_WIDTH}
        mx="auto"
        bgColor={colors.white}
        display="flex"
        flexDirection="column"
        px="24px"
        pt="24px"
      >
        {top}

        {currentIndex > 0 && !isEnding && (
          <Box ref={setInert} pointerEvents="none" aria-hidden>
            <PreviousPageButton onClick={noop} />
          </Box>
        )}

        <FormProvider {...previewMethods}>
          {isDemographicsPage ? (
            // Shown as participants see it; the questions come from the
            // access rights settings and can't be edited here.
            <Box ref={setInert} pointerEvents="none" aria-hidden>
              <PageTitle page={group.page} />
              <CustomFieldsSignupHelperText />
              <CustomFields
                questions={visibleQuestions.map(({ field }) => field)}
                projectId={projectId}
                phase={phase}
                participationMethod={phase.attributes.participation_method}
                scrollErrorIntoView={false}
                questionSpacing={FORM_QUESTION_SPACING}
              />
            </Box>
          ) : (
            <PageHeaderBlock key={group.page.id} page={group.page} />
          )}

          {!isLocked && (
            <>
              {visibleQuestions.length === 0 ? (
                <Box
                  onClick={() =>
                    openAddModal({ pageId: group.page.id, index: 0 })
                  }
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
                        />
                        <InsertionPoint
                          pageId={group.page.id}
                          index={position + 1}
                          isDraggingQuestion={isDraggingQuestion}
                        />
                      </React.Fragment>
                    )
                  )}
                </>
              )}
            </>
          )}
        </FormProvider>

        <Box ref={setInert} pointerEvents="none" aria-hidden>
          <PageControlButtons
            inline
            showPrevious={false}
            handleNextAndSubmit={noop}
            handlePrevious={noop}
            hasPreviousPage={currentIndex > 0}
            isLoading={false}
            pageVariant={pageVariant}
            phases={phases?.data}
            currentPhase={phase}
            pageButtonLabelMultiloc={group.page.page_button_label_multiloc}
            pageButtonLink={group.page.page_button_link}
            project={project}
            pageQuestions={visibleQuestions.map(({ field }) => field)}
            currentPageIndex={currentIndex}
          />
        </Box>

        {/* Same room below the page as participants get. */}
        <Box flex="1" minHeight="80px" />

        {/* The progress card, overlaying the bottom of the column like the
            fixed card on the participant page: a zero-height anchor that
            sticks to the bottom of the canvas, with the card drawn above it.
            Not clickable here: its language switcher would change the
            admin's own language. */}
        <Box position="sticky" bottom="0" h="0px" mx="-24px" zIndex="2">
          <Box
            position="absolute"
            left="0"
            right="0"
            bottom="0"
            ref={setInert}
            pointerEvents="none"
            aria-hidden
          >
            <ProgressFooter
              position="relative"
              formCompletionPercentage={
                lastIndex > 0 ? Math.round((currentIndex / lastIndex) * 100) : 0
              }
              currentPage={currentIndex + 1}
              totalPages={lastIndex}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Canvas;
