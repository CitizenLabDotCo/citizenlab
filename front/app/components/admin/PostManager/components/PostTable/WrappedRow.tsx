import React from 'react';
import { Table } from 'semantic-ui-react';

// Little hack needed to apply react DnD to the custom component
const WrappedRow = (props) => {
  return <Table.Row {...props} />;
};

export default WrappedRow;
