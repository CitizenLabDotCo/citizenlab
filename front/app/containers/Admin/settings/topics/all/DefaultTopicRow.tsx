import React from 'react';

import { ITopicData } from 'api/topics/types';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

// components
import { Row } from 'components/admin/ResourceList';
import { RowContent, RowContentInner, RowTitle } from './RowStyles';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

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
