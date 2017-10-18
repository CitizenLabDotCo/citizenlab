import * as React from 'react';

// components
import Icon from 'components/UI/Icon';

// style
import styled from 'styled-components';

const Text = styled.span`
  color: #84939E;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  transition: all 100ms ease-out;
`;

const DropdownIcon = styled(Icon)`
  height: 7px;
  fill: #84939E;
  margin-left: 5px;
  margin-top: 3px;
  transition: all 100ms ease-out;
`;

const StyledButton = styled.button`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  margin: 0;
  position: relative;

  &:hover,
  &.deployed {
    ${Text} {
      color: #000;
    }

    ${DropdownIcon} {
      fill: #000;
    }
  }
`;

type Props = {
  title: string,
  deployed: boolean,
  onClick: Function,
  baseID: string,
};

type State = {};

export default class Title extends React.PureComponent<Props, State> {
  handleClick = (event) => {
    this.props.onClick(event);
  }

  render() {
    const { title, onClick, deployed, baseID } = this.props;

    return (
      <StyledButton
        onClick={this.handleClick}
        aria-expanded={deployed}
        id={`${baseID}-label`}
        className={deployed ? 'deployed' : ''}
      >
        <Text>{title}</Text>
        <DropdownIcon name="dropdown" />
      </StyledButton>
    );
  }
}
