import React, { memo } from 'react';

import { ITopicData } from 'services/topics';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

// components
import { TextCell, Row } from 'components/admin/ResourceList';
import T from 'components/T';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const DefaultTopicLabel = styled.span``;

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
        <DefaultTopicLabel>
          <FormattedMessage {...messages.defaultTopic} />
        </DefaultTopicLabel>
      </Row>
    );
  }

  return null;

});

export default DefaultTopicRow;
