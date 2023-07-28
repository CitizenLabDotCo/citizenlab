import React, { FormEvent } from 'react';
import styled from 'styled-components';
import Button from 'components/UI/Button';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div`
  display: inline-block;
`;

type Props = {
  onClick: (arg: FormEvent) => void;
  className?: string;
  customMessage?: MessageDescriptor;
};

const GoBackButton = ({ onClick, className, customMessage }: Props) => {
  return (
    <Container className={className || ''}>
      <Button
        id="e2e-go-back-button"
        onClick={onClick}
        buttonStyle="text"
        icon="arrow-left"
        size="m"
        padding="0px"
        text={<FormattedMessage {...(customMessage || messages.goBack)} />}
        data-testid="goBackButton"
      />
    </Container>
  );
};

export default GoBackButton;
