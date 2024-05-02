import React from 'react';

import styled from 'styled-components';

import { ManagerType } from '../../';

import ExportIdeasButton from './ExportIdeasButton';
import ExportIdeasCommentsButton from './ExportIdeasCommentsButton';
import ExportInitiativesButton from './ExportInitiativesButton';
import ExportInitiativesCommentsButton from './ExportInitiativesCommentsButton';

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
  className?: string;
}

const ExportButtons = ({
  exportType,
  className,
  exportQueryParameter,
  type,
}: Props) => {
  return (
    // TODO: use DropdownListItem instead of custom styles in Container.
    // E.g., see front/app/containers/Admin/projects/project/nativeSurvey/index.tsx
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
};

export default ExportButtons;
