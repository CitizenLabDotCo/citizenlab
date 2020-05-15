import React, { memo } from 'react';
import { TextCell, Row } from 'components/admin/ResourceList';
import T from 'components/T';
import { ITopicData } from 'services/topics';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  topic: ITopicData | Error;
  isLastItem: boolean;
}

const DefaultTopicRow = memo((props: Props) => {
  const { isLastItem, topic } = props;

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
      </Row>
    );
  }

  return null;

});

export default DefaultTopicRow;
