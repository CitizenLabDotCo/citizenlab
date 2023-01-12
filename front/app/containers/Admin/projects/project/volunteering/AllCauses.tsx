import React, { useCallback, useState, MouseEvent } from 'react';
import styled from 'styled-components';
import { clone } from 'lodash-es';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import { isNilOrError } from 'utils/helperUtils';

import useCauses from 'hooks/useCauses';
import { ICauseData, reorderCause, deleteCause } from 'services/causes';

import { List, SortableRow, TextCell } from 'components/admin/ResourceList';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import Button from 'components/UI/Button';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';
import T from 'components/T';

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
  const { formatMessage } = useIntl();
  const phaseId =
    participationContextType === 'phase' ? participationContextId : null;
  const causes = useCauses({ projectId, phaseId });
  const [itemsWhileDragging, setItemsWhileDragging] = useState<
    ICauseData[] | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = itemsWhileDragging || (isNilOrError(causes) ? [] : causes.data);

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
        reorderCause(causeId, toIndex).finally(() => setIsProcessing(false));
      } else {
        setItemsWhileDragging(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isProcessing, items]
  );

  const handleOnClickDelete = (causeId: string) => (event: MouseEvent) => {
    if (!isProcessing) {
      const deleteMessage = formatMessage(messages.causeDeletionConfirmation);
      event.preventDefault();

      if (window.confirm(deleteMessage)) {
        setItemsWhileDragging(null);
        setIsProcessing(true);
        deleteCause(causeId).finally(() => {
          setIsProcessing(false);
        });
      }
    }
  };

  const newCauseLink = phaseId
    ? `/admin/projects/${projectId}/volunteering/phases/${phaseId}/causes/new`
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
