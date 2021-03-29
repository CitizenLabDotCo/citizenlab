import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { clone } from 'lodash-es';
import { DragDropContext } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import { isNilOrError } from 'utils/helperUtils';

import useCauses from 'hooks/useCauses';
import { ICauseData, reorderCause, deleteCause } from 'services/causes';

import { List, SortableRow, TextCell } from 'components/admin/ResourceList';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import Button from 'components/UI/Button';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import T from 'components/T';
import { InjectedIntlProps } from 'react-intl';

const Container = styled.div``;

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

interface InputProps {
  participationContextType: 'project' | 'phase';
  participationContextId: string;
  projectId: string;
}

interface Props extends InputProps, InjectedIntlProps {}

const AllCauses = ({
  participationContextType,
  participationContextId,
  projectId,
  intl,
}: Props) => {
  const phaseId =
    participationContextType === 'phase' ? participationContextId : null;
  const causes = useCauses({ projectId, phaseId });
  const [itemsWhileDragging, setItemsWhileDragging] = useState<
    ICauseData[] | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
    [isProcessing, items]
  );

  const handleOnClickDelete = (cause) => (event) => {
    if (!isProcessing) {
      const deleteMessage = intl.formatMessage(
        messages.causeDeletionConfirmation
      );
      event.preventDefault();

      if (window.confirm(deleteMessage)) {
        setItemsWhileDragging(null);
        setIsProcessing(true);
        deleteCause(cause.id).finally(() => {
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
          let lastItem = false;
          if (index === items.length - 1) lastItem = true;
          return (
            <SortableRow
              key={cause.id}
              id={cause.id}
              index={index}
              lastItem={lastItem}
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
                  onClick={handleOnClickDelete(cause)}
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

export default DragDropContext(HTML5Backend)(injectIntl<Props>(AllCauses));
