import React from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { Icon } from '@citizenlab/cl2-component-library';
import { isString } from 'lodash-es';

const StyledIcon = styled(Icon)`
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
    color: ${colors.teal400};
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
        {sorted && <StyledIcon name="chevron-down" className={sorted} />}
      </Container>
    );
  }
}
