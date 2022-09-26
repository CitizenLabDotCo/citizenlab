import Button from 'components/UI/Button';
import React, { FormEvent, PureComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import messages from './messages';

const Container = styled.div`
  display: inline-block;
`;

type Props = {
  onClick: (arg: FormEvent) => void;
  className?: string;
};

interface State {}

export default class GoBackButton extends PureComponent<Props, State> {
  render() {
    const { onClick, className } = this.props;

    return (
      <Container className={className || ''}>
        <Button
          id="e2e-go-back-button"
          onClick={onClick}
          buttonStyle="text"
          icon="arrow-back"
          size="2"
          padding="0px"
          text={<FormattedMessage {...messages.goBack} />}
          data-testid="goBackButton"
        />
      </Container>
    );
  }
}
