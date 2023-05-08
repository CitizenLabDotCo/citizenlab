import React, { useCallback, useState, MouseEvent, useMemo } from 'react';
import styled from 'styled-components';
import { clone } from 'lodash-es';
import { DndProvider } from 'react-dnd-cjs';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { isNilOrError } from 'utils/helperUtils';

import useCauses from 'api/causes/useCauses';
import { ICauseData } from 'api/causes/types';

import { List, SortableRow, TextCell } from 'components/admin/ResourceList';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import Button from 'components/UI/Button';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';
import T from 'components/T';
import useDeleteCause from 'api/causes/useDeleteCause';
import useReorderCause from 'api/causes/useReorderCause';

const Container = styled.div``;

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

interface Props {
  participationContextType: 'project' | 'phase';
  participationContextId: string;
  projectId: string;
}

const AllCauses = ({
  participationContextType,
  participationContextId,
  projectId,
}: Props) => {
  const { mutate: deleteCause } = useDeleteCause();
  const { mutate: reorderCause } = useReorderCause();
  const { formatMessage } = useIntl();

  const { data: causes } = useCauses({
    participationContextType,
    participationContextId,
  });
  const [itemsWhileDragging, setItemsWhileDragging] = useState<
    ICauseData[] | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const items = useMemo(
    () => itemsWhileDragging || (isNilOrError(causes) ? [] : causes.data),
    [itemsWhileDragging, causes]
  );

  const handleDragRow = useCallback(
    (fromIndex, toIndex) => {
      if (!isProcessing) {
        if (!items) return;
        const itemsWhileDragging = clone(items);
        itemsWhileDragging.splice(fromIndex, 1);
        itemsWhileDragging.splice(toIndex, 0, items[fromIndex]);
        setItemsWhileDragging(itemsWhileDragging);
      }
    },
    [isProcessing, items]
  );

  const handleDropRow = useCallback(
    (causeId: string, toIndex: number) => {
      if (!items) return;

      const cause = items.find((item) => item.id === causeId);

      if (cause && cause.attributes.ordering !== toIndex) {
        setIsProcessing(true);
        reorderCause(
          { id: causeId, ordering: toIndex },
          { onSuccess: () => setIsProcessing(false) }
        );
      } else {
        setItemsWhileDragging(null);
      }
    },
    [items, reorderCause]
  );

  const handleOnClickDelete = (causeId: string) => (event: MouseEvent) => {
    if (!isProcessing) {
      const deleteMessage = formatMessage(messages.causeDeletionConfirmation);
      event.preventDefault();

      if (window.confirm(deleteMessage)) {
        setItemsWhileDragging(null);
        setIsProcessing(true);
        deleteCause(causeId, { onSuccess: () => setIsProcessing(false) });
      }
    }
  };

  const newCauseLink =
    participationContextType === 'phase'
      ? `/admin/projects/${projectId}/volunteering/phases/${participationContextId}/causes/new`
      : `/admin/projects/${projectId}/volunteering/causes/new`;

  if (isNilOrError(causes)) return null;

  return (
    <Container>
      <ButtonWrapper>
        <Button buttonStyle="cl-blue" icon="plus-circle" linkTo={newCauseLink}>
          <FormattedMessage {...messages.addCauseButton} />
        </Button>
      </ButtonWrapper>
      <List key={causes.data.length}>
        {items.map((cause, index) => {
          return (
            <SortableRow
              key={cause.id}
              id={cause.id}
              index={index}
              isLastItem={index === items.length - 1}
              moveRow={handleDragRow}
              dropRow={handleDropRow}
            >
              <TextCell className="expand">
                <T value={cause.attributes.title_multiloc} />
              </TextCell>
              <div>
                <FormattedMessage
                  {...messages.xVolunteers}
                  values={{ x: cause.attributes.volunteers_count }}
                />
              </div>
              <Buttons>
                <Button
                  onClick={handleOnClickDelete(cause.id)}
                  icon="delete"
                  buttonStyle="text"
                >
                  <FormattedMessage {...messages.deleteButtonLabel} />
                </Button>
                <Button
                  linkTo={`/admin/projects/${projectId}/volunteering/causes/${cause.id}`}
                  icon="edit"
                  buttonStyle="secondary"
                >
                  <FormattedMessage {...messages.editButtonLabel} />
                </Button>
              </Buttons>
            </SortableRow>
          );
        })}
      </List>
    </Container>
  );
};

export default (props: Props) => (
  <DndProvider backend={HTML5Backend}>
    <AllCauses {...props} />
  </DndProvider>
);
