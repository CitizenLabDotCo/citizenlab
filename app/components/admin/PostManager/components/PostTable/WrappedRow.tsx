import React from 'react';
import { Table } from 'semantic-ui-react';

// Little hack needed to apply react DnD to the custom component
export default class WrappedRow extends React.Component<any> {
  render() {
    return <Table.Row {...this.props} />;
  }
}
