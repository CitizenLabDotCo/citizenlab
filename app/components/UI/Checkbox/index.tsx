import * as React from 'react';
import Icon from 'components/UI/Icon';
import styled from 'styled-components';

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
  background: ${(props: any) => props.checked ? props.theme.colors.success : '#fff'};
  border-color: ${(props: any) => props.checked ? props.theme.colors.success : '#aaa'};
  box-shadow: inset 0px 1px 1px rgba(0, 0, 0, 0.15);

  &:hover {
    border-color: ${(props: any) => props.checked ? props.theme.colors.success : '#333'};
  }
`;

const CheckmarkIcon = styled(Icon)`
  fill: #fff;
  height: 55%;
`;

const Text = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  padding-left: 10px;
  cursor: pointer;
`;

type Props = {
  value: boolean;
  onChange: (event: React.FormEvent<any>) => void;
  label?: string | JSX.Element | null | undefined;
  size?: string | undefined;
  disableLabelClick?: boolean;
  className?: string;
};

type State = {};

export default class Checkbox extends React.PureComponent<Props, State> {
  toggleCheckbox = (event: React.FormEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onChange(event);
  }

  handleLabelOnClick = (event: React.FormEvent<any>) => {
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
