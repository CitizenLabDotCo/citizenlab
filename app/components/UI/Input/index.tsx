import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Error from 'components/UI/Error';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container: any = styled.div`
  position: relative;

  input {
    box-shadow: inset 0px 2px 3px rgba(0, 0, 0, 0.15);
    width: 100%;
    color: #333;
    font-size: 17px;
    line-height: 24px;
    font-weight: 400;
    padding: 12px;
    border-radius: 5px;
    border: solid 1px;
    border-color: ${(props: any) => props.error ? '#fc3c2d' : '#ccc'};
    background: #fff;
    outline: none;

    &::placeholder {
      color: #aaa;
      opacity: 1;
    }

    &:hover,
    &:focus {
      border-color: ${(props: any) => props.error ? '#fc3c2d' : '#999'};
    }

    ${media.biggerThanPhone`
      padding-right: ${props => props.error && '40px'};
    `}
  }
`;

export type Props = {
  id?: string | undefined;
  value?: string | null | undefined;
  type: 'text' | 'email' | 'password';
  placeholder?: string | null | undefined;
  error?: string | null | undefined;
  onChange: (arg: string) => void;
  onFocus?: (arg: any) => void;
  setRef?: (arg: HTMLInputElement) => void | undefined;
  autoFocus?: boolean;
};

type State = {};

export default class Input extends React.PureComponent<Props, State> {
  handleOnChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.props.onChange(event.currentTarget.value);
  }

  handleRef = (element: HTMLInputElement) => {
    if (_.isFunction(this.props.setRef)) {
      this.props.setRef(element);
    }
  }

  render() {
    let { value, placeholder, error } = this.props;
    const className = this.props['className'];
    const { id, type } = this.props;
    const hasError = (_.isString(error) && !_.isEmpty(error));

    value = (value || '');
    placeholder = (placeholder || '');
    error = (error || null);

    return (
      <Container error={hasError} className={className}>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={this.handleOnChange}
          onFocus={this.props.onFocus}
          ref={this.handleRef}
          autoFocus={this.props.autoFocus}
        />
        <div>
          <Error text={error} size="1" />
        </div>
      </Container>
    );
  }
}
