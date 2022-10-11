import React from 'react';
import { Row } from 'components/admin/Table';

// Little hack needed to apply react DnD to the custom component
export default class WrappedRow extends React.Component<any> {
  render() {
    return <Row {...(this.props as any)} />;
  }
}
