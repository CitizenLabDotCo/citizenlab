import React, { memo } from 'react';
import { ITopicData } from 'services/topics';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

// components
import { TextCell, Row } from 'components/admin/ResourceList';
import T from 'components/T';
import Button from 'components/UI/Button';

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
        <TextCell className="expand">
          <T value={topic.attributes.title_multiloc} />
        </TextCell>
        <Buttons>
          <Button
            onClick={handleDeleteClick(topic.id)}
            buttonStyle="text"
            icon="delete"
          >
            <FormattedMessage {...messages.deleteButtonLabel} />
          </Button>

          <Button
            linkTo={`/admin/settings/topics/${topic.id}`}
            buttonStyle="secondary"
            icon="edit"
          >
            <FormattedMessage {...messages.editButtonLabel} />
          </Button>
        </Buttons>
      </Row>
    );
  }

  return null;

});

export default DefaultTopicRow;
