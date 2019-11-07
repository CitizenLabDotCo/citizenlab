import React from 'react';
import styled from 'styled-components';
import { fontSizes, colors, invisibleA11yText, booleanClass } from 'utils/styleUtils';

const Container = styled.label`
  color: ${colors.label};
  display: inline-block;
  display: flex;
  align-items: center;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  margin-bottom: 10px;

  & > :not(last-child) {
    margin-right: 4px;
  }

  &.invisible {
    ${invisibleA11yText}
  }
`;

type Props = {
  id?: string;
  value?: string | JSX.Element;
  htmlFor?: string;
  children?: any;
  hidden?: boolean;
  className?: string;
};

type State = {};

export default class Label extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { value, htmlFor, children, id, className } = this.props;

    return (
      <Container
        id={id}
        className={`${className} ${booleanClass(className, className)} ${booleanClass(this.props.hidden, 'invisible')}`}
        htmlFor={htmlFor}
      >
        {children || value}
      </Container>
    );
  }
}
