import React, { useEffect } from 'react';

import {
  Box,
  colors,
  Icon,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';
import { useDrag, useDrop } from 'react-dnd';

import useLocalize from 'hooks/useLocalize';

import formBuilderMessages from 'components/FormBuilder/components/messages';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import {
  DND_PAGE,
  DND_QUESTION,
  DragItem,
  PAGE_SWITCH_HOVER_DELAY,
  useBuilder,
} from '../context';
import messages from '../messages';
import {
  PageActionBlocker,
  PageGroup,
  isFormEndPage,
  isUserPage,
} from '../utils';

import PageActionsMenu, { PageMenuAction } from './PageActionsMenu';

type Props = {
  group: PageGroup;
  pageIndex: number;
};

type Collected = {
  isOver: boolean;
  draggedType: string | symbol | null;
  canDrop: boolean;
};

const PageCard = ({ group, pageIndex }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const {
    currentPageId,
    showPage,
    dropQuestion,
    dropPage,
    erroredFieldIds,
    selectedFieldId,
    closeSettings,
    deleteField,
    duplicatePage,
    getPageBlocker,
  } = useBuilder();
  const { page, questions } = group;
  const isEnd = isFormEndPage(page);
  // The demographics page can be viewed but not changed or dropped onto.
  const isReadOnly = isUserPage(page);
  const isCurrent = currentPageId === page.id;

  const [{ isDragging }, drag] = useDrag<
    DragItem,
    unknown,
    { isDragging: boolean }
  >({
    type: DND_PAGE,
    item: { id: page.id },
    canDrag: () => !isEnd && !isReadOnly,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [{ isOver, draggedType, canDrop }, drop] = useDrop<
    DragItem,
    unknown,
    Collected
  >({
    accept: [DND_QUESTION, DND_PAGE],
    canDrop: (item, monitor) =>
      !isReadOnly &&
      (monitor.getItemType() === DND_QUESTION ? !isEnd : item.id !== page.id),
    drop: (item, monitor) => {
      if (monitor.getItemType() === DND_QUESTION) {
        dropQuestion(item.id, { pageId: page.id, index: questions.length });
      } else {
        dropPage(item.id, pageIndex);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      draggedType: monitor.getItemType(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Holding a dragged question over a page opens that page, so the question
  // can be dropped exactly where it should go.
  const hoveringWithQuestion =
    isOver && canDrop && draggedType === DND_QUESTION;
  useEffect(() => {
    if (!hoveringWithQuestion || isCurrent) return;
    const timer = setTimeout(() => showPage(page.id), PAGE_SWITCH_HOVER_DELAY);
    return () => clearTimeout(timer);
  }, [hoveringWithQuestion, isCurrent, page.id, showPage]);

  const title = localize(page.title_multiloc);
  const hasError =
    erroredFieldIds.has(page.id) ||
    questions.some(({ field }) => erroredFieldIds.has(field.id));
  const isDropHighlighted = isOver && canDrop;

  const borderColor = isDropHighlighted
    ? colors.teal400
    : hasError
    ? colors.red600
    : isCurrent
    ? colors.primary
    : colors.grey300;

  // Only shows the page in the canvas; its settings open from the page
  // header there. Settings that are open for something else are closed (and
  // autosaved), like with their X.
  const openPage = () => {
    showPage(page.id);
    if (selectedFieldId) closeSettings(true);
  };

  const blockerMessages: Record<
    'delete' | 'duplicate',
    Record<PageActionBlocker, MessageDescriptor>
  > = {
    delete: {
      formEnd: messages.blockedFormEndDelete,
      demographics: messages.blockedDemographics,
      onlyPage: messages.blockedOnlyPage,
      locked: messages.blockedLocked,
      mapQuestions: messages.blockedLocked,
    },
    duplicate: {
      formEnd: messages.blockedFormEndDuplicate,
      demographics: messages.blockedDemographics,
      onlyPage: messages.blockedLocked,
      locked: messages.blockedLocked,
      mapQuestions: messages.blockedMapQuestions,
    },
  };
  const disabledReason = (action: 'delete' | 'duplicate') => {
    const blocker = getPageBlocker(action, page.id);
    return blocker
      ? formatMessage(blockerMessages[action][blocker])
      : undefined;
  };

  const actions: PageMenuAction[] = [
    {
      label: formatMessage(messages.duplicate),
      icon: 'copy',
      onClick: () => duplicatePage(page.id),
      disabledReason: disabledReason('duplicate'),
    },
    {
      label: formatMessage(messages.delete),
      icon: 'delete',
      onClick: () => deleteField(page.id),
      disabledReason: disabledReason('delete'),
    },
  ];

  return (
    <Box
      ref={(element: HTMLDivElement | null) => drag(drop(element))}
      role="button"
      tabIndex={0}
      aria-current={isCurrent ? 'page' : undefined}
      onClick={openPage}
      onKeyDown={(event) => {
        // Ignore keys meant for the actions menu inside the card.
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPage();
        }
      }}
      display="flex"
      gap="10px"
      alignItems="flex-start"
      p="10px"
      mb="8px"
      bgColor={
        isDropHighlighted ? colors.teal50 : isCurrent ? colors.teal50 : 'white'
      }
      border={`${isCurrent || isDropHighlighted ? 2 : 1}px ${
        isDropHighlighted ? 'dashed' : 'solid'
      } ${borderColor}`}
      borderRadius={stylingConsts.borderRadius}
      opacity={isDragging ? 0.4 : 1}
      style={{ cursor: isEnd || isReadOnly ? 'pointer' : 'grab' }}
      data-cy="e2e-form-builder-new-page-card"
    >
      <Box
        flex="0 0 auto"
        w="28px"
        h="36px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="3px"
        bgColor={isCurrent ? colors.primary : colors.grey200}
      >
        {isEnd ? (
          <Icon
            name="sportsScore"
            width="16px"
            height="16px"
            fill={isCurrent ? colors.white : colors.textSecondary}
          />
        ) : (
          <Text
            m="0px"
            fontSize="s"
            fontWeight="bold"
            color={isCurrent ? 'white' : 'textSecondary'}
          >
            {pageIndex + 1}
          </Text>
        )}
      </Box>
      <Box minWidth="0px" flex="1">
        <Text
          m="0px"
          fontSize="s"
          fontWeight={selectedFieldId === page.id ? 'bold' : 'semi-bold'}
          color="textPrimary"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title || formatMessage(messages.untitledPage)}
        </Text>
        <Text m="0px" mt="2px" fontSize="xs" color="textSecondary">
          {isEnd
            ? formatMessage(formBuilderMessages.formEnd)
            : formatMessage(messages.questionCount, {
                count: questions.filter(({ field }) => field.enabled !== false)
                  .length,
              })}
          {isReadOnly && ` · ${formatMessage(messages.readOnlyPage)}`}
        </Text>
      </Box>
      <Box flex="0 0 auto">
        <PageActionsMenu actions={actions} />
      </Box>
    </Box>
  );
};

export default PageCard;
