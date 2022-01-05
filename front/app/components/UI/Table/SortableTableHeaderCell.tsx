import React from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { Icon } from '@citizenlab/cl2-component-library';
import { isString } from 'lodash-es';

const StyledIcon = styled(Icon)`
  height: 7px;
  width: 10px;
  margin-left: 5px;
  margin-top: -2px;

  &.ascending {
    transform: rotate(180deg);
  }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  user-select: none;
  cursor: pointer;

  &:hover {
    color: ${colors.clIconAccent};
  }
`;

interface Props {
  value: string | JSX.Element;
  sorted: 'ascending' | 'descending' | null;
  onClick: () => void;
  className?: string;
}

interface State {}

export default class SortableTableHeaderCell extends React.PureComponent<
  Props,
  State
> {
  onClick = (event: React.MouseEvent) => {
    event.preventDefault();
    this.props.onClick();
  };

  render() {
    const { value, sorted, className } = this.props;

    return (
      <Container
        className={`${className ? className : ''} ${sorted ? 'active' : ''}`}
        onClick={this.onClick}
      >
        {isString(value) ? <span>{value}</span> : value}
        {sorted && <StyledIcon name="dropdown" className={sorted} />}
      </Container>
    );
  }
}
