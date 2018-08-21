import React, { PureComponent, FormEvent } from 'react';
import Icon from 'components/UI/Icon';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container: any = styled.div`
  &:not(.hasLabel) {
    flex: 0 0 ${(props: any) => props.size};
    width: ${(props: any) => props.size};
    height: ${(props: any) => props.size};
  }

  &.hasLabel {
    display: flex;
    align-items: center;
  }
`;

const CheckboxContainer: any = styled.div`
  flex: 0 0 ${(props: any) => props.size};
  width: ${(props: any) => props.size};
  height: ${(props: any) => props.size};
  color: #fff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: solid 1px #aaa;
  border-radius: 3px;
  background: #fff;
  background: ${(props: any) => props.checked ? props.theme.colors.clGreen : '#fff'};
  border-color: ${(props: any) => props.checked ? props.theme.colors.clGreen : '#aaa'};
  box-shadow: inset 0px 1px 1px rgba(0, 0, 0, 0.15);

  &:hover {
    border-color: ${(props: any) => props.checked ? props.theme.colors.clGreen : '#333'};
  }
`;

const CheckmarkIcon = styled(Icon)`
  fill: #fff;
  height: 55%;
`;

const Text = styled.div`
  color: ${colors.label};
  padding-left: 10px;
  cursor: pointer;
`;

type Props = {
  value: boolean;
  onChange: (event: FormEvent) => void;
  label?: string | JSX.Element | null | undefined;
  size?: string | undefined;
  disableLabelClick?: boolean;
  className?: string;
};

type State = {};

export default class Checkbox extends PureComponent<Props, State> {
  toggleCheckbox = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onChange(event);
  }

  handleLabelOnClick = (event: FormEvent) => {
    if (this.props.disableLabelClick !== true) {
      this.toggleCheckbox(event);
    }
  }

  render() {
    const className = this.props['className'];
    const { size, value, label } = this.props;
    const checkboxSize = (size || '22px');

    return (
      <Container className={`${className} ${label && 'hasLabel'}`} size={checkboxSize}>
        <CheckboxContainer checked={value} size={checkboxSize} onClick={this.toggleCheckbox}>
          {value && <CheckmarkIcon name="checkmark" />}
        </CheckboxContainer>
        {label && <Text onClick={this.handleLabelOnClick}>{label}</Text>}
      </Container>
    );
  }
}
