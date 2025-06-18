import React, { useCallback, useState, MouseEvent, useMemo } from 'react';

import { clone } from 'lodash-es';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RouteType } from 'routes';
import styled from 'styled-components';

import { ICauseData } from 'api/causes/types';
import useCauses from 'api/causes/useCauses';
import useDeleteCause from 'api/causes/useDeleteCause';
import useReorderCause from 'api/causes/useReorderCause';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import { List, TextCell } from 'components/admin/ResourceList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

const Container = styled.div``;

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

interface Props {
  phaseId: string;
  projectId: string;
}

const AllCauses = ({ phaseId, projectId }: Props) => {
  const { mutate: deleteCause } = useDeleteCause();
  const { mutate: reorderCause } = useReorderCause();
  const { formatMessage } = useIntl();

  const { data: causes } = useCauses({
    phaseId,
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

  const newCauseLink: RouteType = `/admin/projects/${projectId}/phases/${phaseId}/volunteering/causes/new`;

  if (isNilOrError(causes)) return null;

  return (
    <Container>
      <ButtonWrapper>
        <ButtonWithLink
          buttonStyle="admin-dark"
          icon="plus-circle"
          linkTo={newCauseLink}
        >
          <FormattedMessage {...messages.addCauseButton} />
        </ButtonWithLink>
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
                <ButtonWithLink
                  onClick={handleOnClickDelete(cause.id)}
                  icon="delete"
                  buttonStyle="text"
                >
                  <FormattedMessage {...messages.deleteButtonLabel} />
                </ButtonWithLink>
                <ButtonWithLink
                  linkTo={`/admin/projects/${projectId}/phases/${phaseId}/volunteering/causes/${cause.id}`}
                  icon="edit"
                  buttonStyle="secondary-outlined"
                >
                  <FormattedMessage {...messages.editButtonLabel} />
                </ButtonWithLink>
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
