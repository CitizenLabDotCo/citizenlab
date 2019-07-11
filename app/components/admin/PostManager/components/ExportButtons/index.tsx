import React from 'react';
import styled from 'styled-components';

// components
import ExportIdeasButton from './ExportIdeasButton';
import ExportIdeasCommentsButton from './ExportIdeasCommentsButton';
import { exportType } from '../ExportMenu';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px;

  & > *:not(:last-child) {
    margin-bottom: 20px;
  }
`;

interface Props {
  exportType: exportType;
  exportQueryParameter: 'all' | string | string[];
  className?: string;
}

class ExportButtons extends React.PureComponent<Props> {

  render() {
    const { exportType, className, exportQueryParameter } = this.props;
    return (
      <Container className={className}>
        <ExportIdeasButton
          exportType={exportType}
          exportQueryParameter={exportQueryParameter}
        />
        <ExportIdeasCommentsButton
          exportType={exportType}
          exportQueryParameter={exportQueryParameter}
        />
      </Container>
    );
  }
}

export default ExportButtons;
