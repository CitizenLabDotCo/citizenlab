import React, { PureComponent, FormEvent } from 'react';
import styled from 'styled-components';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
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
          onClick={onClick}
          buttonStyle="text"
          icon="arrow-back"
          size="2"
          padding="0px"
          text={<FormattedMessage {...messages.goBack} />}
        />
      </Container>
    );
  }
}
