import * as React from 'react';
import styledComponents from 'styled-components';
const styled = styledComponents;

type Props = {
  id: string,
  title: string,
  selected: boolean,
  onClick: (id: string) => void
};

const Container = styled.div`
  width: 100%;
  color: #333;
  font-size: 18px;
  font-weight: 600;
  padding: 20px;
  cursor: pointer;
  user-select: none;
  background: ${props => props.selected ? '#eee' : '#fff'};

  &:hover {
    background: #eee;
  }
`;

export default class IdeaTitle extends React.PureComponent<Props> {
  handleOnClick = () => {
    this.props.onClick(this.props.id);
  }

  render() {
    const { id, title, selected } = this.props;
    console.log(`Rendered IdeaTitle for idea ${id}`);
    return <Container onClick={this.handleOnClick} selected={selected}>{title}</Container>;
  }
}
