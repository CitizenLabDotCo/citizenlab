import * as React from 'react';

// components
import Icon from 'components/UI/Icon';

// style
import styled from 'styled-components';

const DropdownIcon = styled(Icon)`
  height: 7px;
  fill: #84939E;
  margin-left: 5px;
  margin-top: 3px;
  transition: transform 100ms ease-out;
`;

const StyledButton = styled.button`
  color: #84939E;
  cursor: pointer;
  font-size: 16px;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px;
  position: relative;
  z-index: 15;

  &:hover {
    color: #000;

    ${DropdownIcon} {
      fill: #000;
    }
  }

  &.deployed ${DropdownIcon} {
    transform: rotate(180deg);
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
        {title}
        <DropdownIcon name="dropdown" />
      </StyledButton>
    );
  }
}
