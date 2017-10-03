import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Error from 'components/UI/Error';

// style
import styled from 'styled-components';

const StyledTextarea: any = styled.textarea`
  width: 100%;
  color: #333;
  font-size: 18px;
  line-height: 22px;
  font-weight: 400;
  padding: 10px;
  resize: none;
  outline: none;
  border-radius: 5px;
  border: solid 1px #ccc;
  background: #fff;
`;

const Container: any = styled.div`
  position: relative;

  ${StyledTextarea}::placeholder {
    color: #aaa;
    opacity: 1;
  }

  ${StyledTextarea}:not(:focus):hover {
    border-color: ${(props: any) => props.hasError ? '#fc3c2d' : '#999'};
  }

  ${StyledTextarea}:focus {
    border-color: ${(props: any) => props.hasError ? '#fc3c2d' : '#000'};
  }
`;

type Props = {
  name: string;
  value: string;
  placeholder?: string | undefined;
  rows?: number | undefined;
  error?: string | null | undefined;
  onChange?: Function | undefined;
};

type State = {};

export default class TextArea extends React.PureComponent<Props, State> {
  handleOnChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    if (this.props.onChange && _.isFunction(this.props.onChange)) {
      this.props.onChange(event.currentTarget.value);
    }
  }

  render() {
    const className = this.props['className'];
    const { name, rows, placeholder, value, error } = this.props;
    const hasError = (_.isString(error) && !_.isEmpty(error));

    return (
      <Container className={className} hasError={hasError}>
        <StyledTextarea 
          name={name || ''}
          rows={5}
          value={value}
          placeholder={placeholder}
          onChange={this.handleOnChange}
        />
        <Error text={error} />
      </Container>
    );
  }
}
