// Libraries
import * as React from 'react';
import styledComponents from 'styled-components';
const styled = styledComponents;

// Components
import Icon from 'components/Icon';

type TitleProps = {
  title: string,
  deployed: boolean,
  onClick: Function,
  baseID: string,
};

class Title extends React.Component<TitleProps> {

  handleClick = (event): void => {
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

// Style
const StyledTitle = styled(Title)`
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
