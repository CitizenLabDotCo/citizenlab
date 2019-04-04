import React from 'react';
import styled from 'styled-components';
import { Label } from 'semantic-ui-react';
import T from 'components/T';
import GetProject from 'resources/GetProject';

const LabelText = styled.span`
  font-weight: 600;
`;

export default (props: { projectId: string }) => (
  <GetProject id={props.projectId}>
    {(project) => {
      if (!project || project instanceof Error) return null;

      return (
        <Label
          key={project.id}
          color="teal"
          basic={true}
        >
          <LabelText>
            <T value={project.attributes.title_multiloc} />
          </LabelText>
        </Label>
      );
    }}
  </GetProject>
);
