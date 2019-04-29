import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import Icon, { IconNames } from 'components/UI/Icon';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: ${(props: any) => props.theme.borderRadius};
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
  font-size: ${fontSizes.base}px;
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
