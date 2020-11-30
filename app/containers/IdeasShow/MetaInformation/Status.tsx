import React from 'react';
import { Header } from './';
import useIdeaStatus from 'hooks/useIdeaStatus';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import T from 'components/T';

// style
import styled from 'styled-components';

// utils
import { fontSizes } from 'utils/styleUtils';
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div`
  color: #fff;
  font-size: ${fontSizes.xs}px;
  line-height: 16px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  padding: 6px 12px;
  display: inline-block;
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
  background-color: ${(props: any) => props.color};
`;

interface Props {
  className?: string;
  statusId: string;
}

const Status = ({
  className,
  statusId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const ideaStatus = useIdeaStatus({ statusId });

  if (!isNilOrError(ideaStatus)) {
    const color = ideaStatus ? ideaStatus.attributes.color : '#bbb';

    return (
      <>
        <Header>{formatMessage(messages.currentStatus)}</Header>
        <Container
          id="e2e-idea-status-badge"
          className={className}
          color={color}
        >
          <T value={ideaStatus.attributes.title_multiloc} />
        </Container>
      </>
    );
  }

  return null;
};

export default injectIntl(Status);
