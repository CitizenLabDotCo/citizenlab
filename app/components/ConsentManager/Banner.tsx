import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Root = styled.div`
  position: relative;
  padding: 8px;
  padding-right: 40px;
  background: ${colors.clBlueLight};
  color: ${colors.clBlueLightest};
  text-align: center;
  font-size: 12px;
  line-height: 1.3;
  z-index: 10;
`;

const Content = styled.div`
  a,
  button {
    display: inline;
    padding: 0;
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
  }
`;

const P = styled.p`
  margin: 0;
  &:not(:last-child) {
    margin-bottom: 6px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
`;

interface Props {
  onAccept: () => void;
  onChangePreferences: () => void;
}

export default class Banner extends PureComponent<Props> {
  static displayName = 'Banner';

  render() {
    const {
      onAccept,
      onChangePreferences,
    } = this.props;

    return (
      <Root>
        <Content>
          <P>Hi</P>
          <P>
            <button type="button" onClick={onChangePreferences}>
              Click to change
            </button>
          </P>
        </Content>

        <CloseButton
          type="button"
          title="Accept policy"
          aria-label="Accept policy"
          onClick={onAccept}
        >
          ✕
        </CloseButton>
      </Root>
    );
  }
}
