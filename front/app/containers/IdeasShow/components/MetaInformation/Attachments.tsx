import React from 'react';

import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';

import useIdeaFiles from 'api/idea_files/useIdeaFiles';

import {
  Header,
  Item,
} from 'containers/IdeasShow/components/MetaInformation/MetaInfoStyles';

import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import Attachment from './Attachment';
import messages from './messages';

const Container = styled.div``;
const StyledAttachment = styled(Attachment)<{ isLastItem: boolean }>`
  margin-bottom: ${({ isLastItem }) => (!isLastItem ? '10px' : '0')};
`;

interface Props {
  ideaId: string;
  compact?: boolean;
  className?: string;
}

const Attachments = ({
  ideaId,
  compact,
  className,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const { data: files } = useIdeaFiles(ideaId);

  if (!isNilOrError(files) && files.data.length > 0) {
    return (
      <Item className={className || ''} compact={compact}>
        <Header>{formatMessage(messages.attachments)}</Header>
        <Container className={className}>
          {Array.isArray(files.data) &&
            files.data.map((file, index) => (
              <StyledAttachment
                isLastItem={index === files.data.length - 1}
                file={file}
                key={file.id}
              />
            ))}
        </Container>
      </Item>
    );
  }

  return null;
};

export default injectIntl(Attachments);
