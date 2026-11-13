import React from 'react';

import styled from 'styled-components';

import { ManagerType } from '../../';

import ExportIdeasButton from './ExportIdeasButton';
import ExportIdeasCommentsButton from './ExportIdeasCommentsButton';
import ExportVotesByInput from './ExportVotesByInput';
import ExportVotesByUser from './ExportVotesByUser';

import { exportType } from './';

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
  projectId?: string;
  className?: string;
}

const ExportButtons = ({
  exportType,
  className,
  exportQueryParameter,
  projectId,
  type,
}: Props) => {
  return (
    // TODO: use DropdownListItem instead of custom styles in Container.
    <Container className={className}>
      <ExportIdeasButton
        exportType={exportType}
        exportQueryParameter={exportQueryParameter}
        projectId={projectId}
      />
      <ExportIdeasCommentsButton
        exportType={exportType}
        exportQueryParameter={exportQueryParameter}
        projectId={projectId}
      />

      {type === 'ProjectIdeas' && (
        <>
          <ExportVotesByInput />
          <ExportVotesByUser />
        </>
      )}
    </Container>
  );
};

export default ExportButtons;
