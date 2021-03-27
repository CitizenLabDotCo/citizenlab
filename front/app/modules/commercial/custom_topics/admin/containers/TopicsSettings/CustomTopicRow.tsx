import React, { memo } from 'react';
import { ITopicData } from 'services/topics';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

// components
import { Row } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import {
  RowContent,
  RowContentInner,
  RowTitle,
} from '../../components/RowStyles';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

interface Props {
  topic: ITopicData | Error;
  isLastItem: boolean;
  handleDeleteClick: (topicId: string) => (event: React.FormEvent<any>) => void;
}

const DefaultTopicRow = memo((props: Props) => {
  const { isLastItem, topic, handleDeleteClick } = props;

  if (!isNilOrError(topic)) {
    return (
      <Row
        key={topic.id}
        id={topic.id}
        className="e2e-topic-field-row"
        isLastItem={isLastItem}
      >
        <RowContent>
          <RowContentInner>
            <RowTitle value={topic.attributes.title_multiloc} />
          </RowContentInner>
        </RowContent>
        <Buttons>
          <Button
            linkTo={`/admin/settings/topics/${topic.id}/edit`}
            buttonStyle="secondary"
            icon="edit"
            id="e2e-custom-topic-edit-button"
          >
            <FormattedMessage {...messages.editButtonLabel} />
          </Button>

          <Button
            onClick={handleDeleteClick(topic.id)}
            buttonStyle="text"
            icon="delete"
            id="e2e-custom-topic-delete-button"
          >
            <FormattedMessage {...messages.deleteButtonLabel} />
          </Button>
        </Buttons>
      </Row>
    );
  }

  return null;
});

export default DefaultTopicRow;
