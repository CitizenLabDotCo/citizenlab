import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';
import useResourceFiles from 'hooks/useResourceFiles';
// i18n
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { Header, Item } from 'components/IdeasShowComponents/MetaInfoStyles';
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
  const files = useResourceFiles({ resourceType: 'idea', resourceId: ideaId });

  if (!isNilOrError(files) && files.length > 0) {
    return (
      <Item className={className || ''} compact={compact}>
        <Header>{formatMessage(messages.attachments)}</Header>
        <Container className={className}>
          {Array.isArray(files) &&
            files.map((file, index) => (
              <StyledAttachment
                isLastItem={index === files.length - 1}
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
