import React, { PureComponent, FormEvent } from 'react';
import styled from 'styled-components';
import Icon from 'components/UI/Icon';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { colors, fontSizes } from 'utils/styleUtils';

const Container: any = styled.div`
  display: inline-block;
  cursor: pointer;
  color: ${(props: any) => props.inCitizen ? props.theme.colorText : colors.label};
  fill: ${(props: any) => props.inCitizen ? props.theme.colorText : colors.label};

  &:hover {
    fill: #000;
    color: #000;
  }
`;

const ContainerInner = styled.div`
  display: flex;
  align-items: center;
`;

const GoBackIcon = styled(Icon)`
  width: 22px;
  height: 22px;
  margin-right: 5px;
`;

const GoBackText = styled.div`
  & > span {
    font-size: ${fontSizes.large}px;
    font-weight: 400;
  }
`;

type Props = {
  onClick: (arg: FormEvent) => void;
  inCitizen?: boolean;
};

type State = {};

export default class GoBackButton extends PureComponent<Props, State> {
  render() {
    const className = this.props['className'];
    const { inCitizen, onClick } = this.props;

    return (
      <Container className={className} onClick={onClick} inCitizen={inCitizen}>
        <ContainerInner>
          <GoBackIcon name="arrow-back" />
          <GoBackText>
            <FormattedMessage {...messages.goBack} />
          </GoBackText>
        </ContainerInner>
      </Container>
    );
  }
}
