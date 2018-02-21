import * as React from 'react';

// components
import Icon from 'components/UI/Icon';

// style
import styled from 'styled-components';

const Text = styled.span`
  color: ${(props) => props.theme.colors.label};
  font-size: 17px;
  font-weight: 400;
  line-height: 26px;
  transition: all 100ms ease-out;
`;

const DropdownIcon = styled(Icon)`
  height: 7px;
  fill: ${(props) => props.theme.colors.label};
  margin-left: 4px;
  margin-top: 2px;
  transition: all 100ms ease-out;
`;

const Container = styled.div`
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  margin: 0;
  position: relative;
  outline: none;

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
  title: string | JSX.Element,
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
    const { title, deployed, baseID } = this.props;

    return (
      <Container
        onClick={this.handleClick}
        aria-expanded={deployed}
        id={`${baseID}-label`}
        className={`e2e-filter-selector-button FilterSelectorTitle ${deployed ? 'deployed' : ''}`}
      >
        <Text className="FilterSelectorTitleText">{title}</Text>
        <DropdownIcon className="FilterSelectorTitleIcon" name="dropdown" />
      </Container>
    );
  }
}
