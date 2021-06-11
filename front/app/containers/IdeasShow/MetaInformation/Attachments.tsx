import React from 'react';
import styled from 'styled-components';
import Attachment from './Attachment';
import useResourceFiles from 'hooks/useResourceFiles';
import { Header, Item } from 'components/IdeasShowComponents/MetaInfoStyles';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
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
}: Props & InjectedIntlProps) => {
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
