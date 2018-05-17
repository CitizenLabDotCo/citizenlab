import React from 'react';
import styled from 'styled-components';
import { color } from 'utils/styleUtils';
import Icon from 'components/UI/Icon';
import { isString } from 'lodash';

const Container = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover,
  &.active {
    fill: ${color('text')};
    color: ${color('text')};
  }
`;

const StyledIcon = styled(Icon) `
  height: 6px;
  margin-left: 5px;
  margin-top: -1px;

  &.ascending {
    transform: rotate(180deg);
  }
`;

interface Props {
  value: string | JSX.Element;
  sorted: 'ascending' | 'descending' | null;
  onClick: () => void;
}

interface State {}

export default class SortableTableHeaderCell extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  onClick = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    this.props.onClick();
  }

  render() {
    const { value, sorted } = this.props;
    const className = this.props['className'];

    return (
      <Container className={`${className} ${sorted ? 'active' : ''}`} onClick={this.onClick}>
        {isString(value) ? <span>{value}</span> : value}
        {sorted && <StyledIcon name="dropdown" className={sorted} />}
      </Container>
    );
  }
}
