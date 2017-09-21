import * as React from 'react';

// components
import Icon from 'components/UI/Icon';

// style
import styled from 'styled-components';

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
      <button
        onClick={this.handleClick}
        aria-expanded={deployed}
        id={`${baseID}-label`}
        className={deployed ? 'deployed' : ''}
      >
        {title}
        <Icon name="dropdown" />
      </button>
    );
  }
}

const StyledTitle = styled(Title) `
  color: #6b6b6b;
  cursor: pointer;
  font-size: 1.25rem;
  position: relative;
  z-index: 15;

  svg {
    margin-left: .5em;
    transform: rotate(0)};
    transition: all .2s ease-in-out;
  }

  &.deployed svg{
    transform: rotate(180deg);
  }
`;

export default StyledTitle;
