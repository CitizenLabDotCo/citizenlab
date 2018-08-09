import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import Icon from 'components/UI/Icon';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 5px;
  background: ${colors.clBlueDarkBg};
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  fill: ${colors.clBlueDarker};
  padding: 0px;
  margin: 0px;
  margin-right: 12px;
`;

const Text = styled.div`
  color: ${colors.clBlueDarker};
  font-size: ${fontSizes.base};
  line-height: 21px;
  font-weight: 400;

  a {
    color: ${colors.clBlueDarker};
    font-weight: 400;
    text-decoration: underline;

    &:hover {
      color: ${darken(0.15, colors.clBlueDarker)};
    }
  }

  strong {
    font-weight: 600;
  }
`;

interface Props {
  text?: string | JSX.Element;
  children?: string | JSX.Element;
}

export default class Warning extends PureComponent<Props> {
  render() {
    const className = this.props['className'];
    const { text, children } = this.props;

    return (
      <Container className={className}>
        <StyledIcon name="info" />
        <Text>
          {text || children}
        </Text>
      </Container>
    );
  }
}
