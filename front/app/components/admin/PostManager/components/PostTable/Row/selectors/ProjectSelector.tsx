import React from 'react';
import styled from 'styled-components';
import { Label } from 'semantic-ui-react';
import T from 'components/T';
import GetProject from 'resources/GetProject';

const LabelText = styled.span`
  font-weight: 600;
`;

const StyledLabel = styled(Label)`
  white-space: nowrap;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 175px;
`;

export default (props: { projectId: string }) => (
  <GetProject projectId={props.projectId}>
    {(project) => {
      if (!project || project instanceof Error) return null;

      return (
        <StyledLabel key={project.id} color="teal" basic={true}>
          <LabelText>
            <T value={project.attributes.title_multiloc} />
          </LabelText>
        </StyledLabel>
      );
    }}
  </GetProject>
);
