import React from 'react';

import styled from 'styled-components';

import { ITopicData } from 'api/topics/types';

import { Row } from 'components/admin/ResourceList';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';
import { RowContent, RowContentInner, RowTitle } from './RowStyles';

const DefaultTopicLabel = styled.span``;

const StyledRowContentInner = styled(RowContentInner)`
  height: 40px;
`;

interface Props {
  topic: ITopicData | Error;
  isLastItem: boolean;
}

const DefaultTopicRow = (props: Props) => {
  const { isLastItem, topic } = props;

  if (!isNilOrError(topic)) {
    return (
      <Row
        key={topic.id}
        id={topic.id}
        className="e2e-topic-field-row"
        isLastItem={isLastItem}
      >
        <RowContent>
          <StyledRowContentInner>
            <RowTitle value={topic.attributes.title_multiloc} />
          </StyledRowContentInner>
        </RowContent>
        <DefaultTopicLabel>
          <FormattedMessage {...messages.defaultTopic} />
        </DefaultTopicLabel>
      </Row>
    );
  }

  return null;
};

export default DefaultTopicRow;
