import React from 'react';
import styled from 'styled-components';

// components
import ExportIdeasButton from './ExportIdeasButton';
import ExportIdeasCommentsButton from './ExportIdeasCommentsButton';
import ExportInitiativesButton from './ExportInitiativesButton';
import ExportInitiativesCommentsButton from './ExportInitiativesCommentsButton';
import { exportType } from './';
import { ManagerType } from '../../';

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
  type: ManagerType;
  exportType: exportType;
  exportQueryParameter: 'all' | string | string[];
  className?: string;
}

class ExportButtons extends React.PureComponent<Props> {
  render() {
    const { exportType, className, exportQueryParameter, type } = this.props;
    return (
      <Container className={className}>
        {type === 'Initiatives' ? (
          <>
            <ExportInitiativesButton
              exportType={exportType}
              exportQueryParameter={exportQueryParameter}
            />
            <ExportInitiativesCommentsButton
              exportType={exportType}
              exportQueryParameter={exportQueryParameter}
            />
          </>
        ) : type === 'AllIdeas' || type === 'ProjectIdeas' ? (
          <>
            <ExportIdeasButton
              exportType={exportType}
              exportQueryParameter={exportQueryParameter}
            />
            <ExportIdeasCommentsButton
              exportType={exportType}
              exportQueryParameter={exportQueryParameter}
            />
          </>
        ) : null}
      </Container>
    );
  }
}

export default ExportButtons;
