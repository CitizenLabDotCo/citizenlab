import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import { Icon, IconNames } from '@citizenlab/cl2-component-library';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';
import { isPage } from 'utils/helperUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 14px;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${colors.teal100};

  ${isRtl`
    flex-direction: row-reverse;
  `}

  &.adminPage {
    padding: 12px;
  }
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.teal700};
  padding: 0px;
  margin: 0px;
  margin-right: 10px;

  ${isRtl`
    margin-right: 0;
    margin-left: 10px;
  `}
`;

const Text = styled.div`
  color: ${colors.teal700};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;

  a,
  button {
    color: ${colors.teal700};
    font-weight: 400;
    text-decoration: underline;
    display: inline-block;
    padding: 0;
    margin: 0;
    border: none;
    cursor: pointer;
    outline: none;
    transition: all 100ms ease-out;

    &.focus-visible {
      outline: solid 2px #000;
    }

    &:hover {
      color: ${darken(0.15, colors.teal700)};
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
    const adminPage = isPage('admin', location.pathname);

    return (
      <Container
        className={`${className || ''} ${adminPage ? 'adminPage' : ''}`}
      >
        <StyledIcon name={icon || 'info-outline'} />
        <Text>{text || children}</Text>
      </Container>
    );
  }
}
