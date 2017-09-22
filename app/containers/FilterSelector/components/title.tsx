import * as React from 'react';

// components
import Icon from 'components/UI/Icon';

// style
import styled from 'styled-components';
const StyledButton = styled.button`
  align-items: center;
  color: #6b6b6b;
  cursor: pointer;
  display: flex;
  font-size: 1.25rem;
  justify-content: space-between;
  padding: .5rem;
  position: relative;
  z-index: 15;

  svg {
    margin-left: .2em;
    transform: rotate(0)};
    transition: all .2s ease-in-out;
  }

  &.deployed svg{
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

class Title extends React.Component<Props, State> {

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
        <Icon name="dropdown" />
      </StyledButton>
    );
  }
}

export default Title;
