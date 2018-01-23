import * as React from 'react';
import styled from 'styled-components';
import { transparentize, darken } from 'polished';
import Icon from 'components/UI/Icon';
import { color } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 5px;
  background: ${props => transparentize(0.94, props.theme.colors.clBlue)};
`;

const StyledIcon = styled(Icon)`
  height: 20px;
  fill: ${color('clBlue')};
  margin-right: 10px;
`;

const Text = styled.div`
  color: ${color('clBlue')};
  font-size: 16px;
  font-weight: 400;

  a {
    color: ${color('clBlue')};
    font-weight: 400;
    text-decoration: underline;

    &:hover {
      color: ${(props) => darken(0.15, props.theme.colors.clBlue)};
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

export default class Warning extends React.PureComponent<Props> {
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
