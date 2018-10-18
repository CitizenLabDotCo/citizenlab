import React, { Component } from 'react';

export default class Polymorph extends Component {
  static propTypes = {
    as: 'div',
  };

  static defaultProps = {
    as: 'div',
  };

  render() {
    const { as: Representation, ...props } = this.props as any;
    // @ts-ignore: Hard to explain this to TS... see https://github.com/styled-components/styled-components/issues/1956
    return <Representation {...props} />;
  }
}
