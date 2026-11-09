import React, { useRef, useState } from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';
import { ErrorBoundary } from '@sentry/react';
import { useDrag, useDrop } from 'react-dnd';

import { IFlatCustomField } from 'api/custom_fields/types';
import { IPhaseData } from 'api/phases/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import CustomFields from 'components/CustomFieldsForm/CustomFields';

import { useIntl } from 'utils/cl-intl';

import { DND_QUESTION, DragItem, useBuilder } from '../context';
import messages from '../messages';
import { canDuplicate } from '../utils';

import BlockToolbar, { getBlockOutline } from './BlockToolbar';

// Keeps the preview out of reach of the mouse and keyboard: the admin sees the
// question exactly as participants do, but can't answer it.
const setInert = (element: HTMLElement | null) => {
  element?.setAttribute('inert', '');
};

type Props = {
  question: IFlatCustomField;
  pageId: string;
  position: number;
  projectId: string;
  phase: IPhaseData;
};

const QuestionBlock = ({
  question,
  pageId,
  position,
  projectId,
  phase,
}: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = useLocale();
  const {
    selectedFieldId,
    selectField,
    erroredFieldIds,
    setDropTarget,
    duplicateField,
    deleteField,
  } = useBuilder();

  const [{ isDragging }, drag] = useDrag<
    DragItem,
    unknown,
    { isDragging: boolean }
  >({
    type: DND_QUESTION,
    item: { id: question.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    end: () => setDropTarget(null),
  });

  // Dropping is handled by the page container around all blocks; a block only
  // decides whether the question lands above or below it.
  const [, drop] = useDrop<DragItem>({
    accept: DND_QUESTION,
    hover: (_item, monitor) => {
      const rect = ref.current?.getBoundingClientRect();
      const offset = monitor.getClientOffset();
      if (!rect || !offset) return;
      const isAbove = offset.y < rect.top + rect.height / 2;
      setDropTarget({ pageId, index: isAbove ? position : position + 1 });
    },
  });

  const setRefs = (element: HTMLDivElement | null) => {
    ref.current = element;
    drag(drop(element));
  };

  const selected = selectedFieldId === question.id;
  const hasError = erroredFieldIds.has(question.id);
  // `locks` is typed as always present, but the API can leave it out.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const canDelete = !question.constraints?.locks?.deletion;

  // A question that was just added has no key or title yet; give the preview
  // something to render.
  const hasTitle = localize(question.title_multiloc) !== '';
  const previewQuestion: IFlatCustomField = {
    ...question,
    key: question.key || question.temp_id || question.id,
    title_multiloc: hasTitle
      ? question.title_multiloc
      : { [locale]: formatMessage(messages.untitledQuestion) },
  };

  return (
    <Box
      ref={setRefs}
      position="relative"
      borderRadius="3px"
      opacity={isDragging ? 0.4 : 1}
      style={{
        outline: getBlockOutline({ selected, hasError, hovered }),
        outlineOffset: '8px',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => selectField(question.id)}
      data-cy="e2e-form-builder-new-question"
    >
      {(hovered || selected) && !isDragging && (
        <BlockToolbar
          showDragHandle
          dragLabel={formatMessage(messages.dragToMove)}
          actions={[
            ...(canDuplicate(question)
              ? [
                  {
                    icon: 'copy' as const,
                    label: formatMessage(messages.duplicate),
                    onClick: () => duplicateField(question.id),
                  },
                ]
              : []),
            ...(canDelete
              ? [
                  {
                    icon: 'delete' as const,
                    label: formatMessage(messages.delete),
                    onClick: () => deleteField(question.id),
                  },
                ]
              : []),
          ]}
        />
      )}
      <Box ref={setInert} pointerEvents="none" aria-hidden>
        <ErrorBoundary
          fallback={
            <Box mb="24px">
              <Text fontWeight="bold" m="0px">
                {localize(previewQuestion.title_multiloc)}
              </Text>
              <Text color="textSecondary" fontSize="s">
                {formatMessage(messages.questionFailedToRender)}
              </Text>
            </Box>
          }
        >
          <CustomFields
            questions={[previewQuestion]}
            projectId={projectId}
            phase={phase}
            participationMethod={phase.attributes.participation_method}
            scrollErrorIntoView={false}
          />
        </ErrorBoundary>
      </Box>
    </Box>
  );
};

export default QuestionBlock;

export const EmptyBlockHint = ({ children }: { children: React.ReactNode }) => (
  <Box
    border={`1px dashed ${colors.grey400}`}
    borderRadius="3px"
    p="24px"
    mb="24px"
    display="flex"
    justifyContent="center"
  >
    {children}
  </Box>
);
