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
import PageFooter from 'components/CustomFieldsForm/Page/PageFooter';
import PageTitle from 'components/CustomFieldsForm/Page/PageTitle';

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

  return (
    <Box
      ref={drop}
      flex="1"
      h="100vh"
      overflowY="auto"
      bgColor={colors.grey100}
      data-cy="e2e-form-builder-new-canvas"
    >
      <Box maxWidth="700px" mx="auto" pt="40px" pb="80px" px="16px">
        {top}

        {/* Same heading bar participants see above the survey */}
        <Box
          bgColor={colors.white}
          display="flex"
          alignItems="center"
          minHeight={`${stylingConsts.menuHeight}px`}
          px="24px"
          borderBottom={`1px solid ${colors.divider}`}
        >
          <Text color="tenantText" fontSize="m" my="0px">
            {localize(phase.attributes.native_survey_title_multiloc)}
          </Text>
          <Box ml="auto" display="flex">
            <Icon name="close" fill={colors.textSecondary} />
          </Box>
        </Box>

        <Box
          bgColor={colors.white}
          position="relative"
          minHeight="calc(100vh - 260px)"
          pb="140px"
          // Makes the participant footer (position: fixed) stick to the
          // bottom of this card instead of the viewport.
          style={{ transform: 'translateZ(0)' }}
        >
          <FormProvider {...previewMethods}>
            <Box p="24px">
              {isDemographicsPage ? (
                // Shown as participants see it; the questions come from the
                // access rights settings and can't be edited here.
                <>
                  <Box ref={setInert} pointerEvents="none" aria-hidden>
                    <PageTitle page={group.page} />
                    <CustomFieldsSignupHelperText />
                    <CustomFields
                      questions={visibleQuestions.map(({ field }) => field)}
                      projectId={projectId}
                      phase={phase}
                      participationMethod={
                        phase.attributes.participation_method
                      }
                      scrollErrorIntoView={false}
                    />
                  </Box>
                </>
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
            </Box>
          </FormProvider>

          <Box ref={setInert} pointerEvents="none" aria-hidden>
            <PageFooter
              variant={
                currentIndex === lastIndex
                  ? 'after-submission'
                  : nextIsLast
                  ? 'submission'
                  : 'other'
              }
              hasPreviousPage={currentIndex > 0}
              handleNextAndSubmit={noop}
              handlePrevious={noop}
              formCompletionPercentage={
                lastIndex > 0 ? Math.round((currentIndex / lastIndex) * 100) : 0
              }
              pageButtonLabelMultiloc={group.page.page_button_label_multiloc}
              pageButtonLink={group.page.page_button_link}
              phase={phase}
              project={project}
              phases={phases}
              isLoading={false}
              isAdminPage
              isMapPage={group.page.page_layout === 'map'}
              pageQuestions={visibleQuestions.map(({ field }) => field)}
              currentPageIndex={currentIndex}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Canvas;
