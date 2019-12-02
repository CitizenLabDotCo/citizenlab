import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import Icon, { IconNames } from 'components/UI/Icon';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 13px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${colors.clBlueDarkBg};
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  fill: ${colors.clBlueDarker};
  padding: 0px;
  margin: 0px;
  margin-right: 12px;
`;

const Text = styled.div`
  color: ${colors.clBlueDarker};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;

  a,
  button {
    color: ${colors.clBlueDarker};
    font-weight: 400;
    text-decoration: underline;
    display: inline-block;
    padding: 0;
    margin: 0;
    border: none;
    cursor: pointer;
    transition: all 100ms ease-out;

    &:hover {
      color: ${darken(0.15, colors.clBlueDarker)};
      text-decoration: underline;
    }
  }

  strong {
    font-weight: 600;
  }
`;

interface Props {
  text?: string | JSX.Element;
  children?: string | JSX.Element;
  icon?: IconNames;
}

export default class Warning extends PureComponent<Props> {

  render() {
    const className = this.props['className'];
    const { text, children, icon } = this.props;

    return (
      <Container className={className}>
        <StyledIcon name={icon || 'info'} />
        <Text>
          {text || children}
        </Text>
      </Container>
    );
  }
}
