import React from 'react';
import { Label } from 'semantic-ui-react';
import T from 'components/T';
import GetProject from 'resources/GetProject';

export default (props: { projectId: string }) => (
  <GetProject id={props.projectId}>
    {project => {
      if (!project) return null;

      return (
        <Label
          key={project.id}
          color="teal"
          basic={true}
        >
          <T value={project.attributes.title_multiloc} />
        </Label>
      );
    }}
  </GetProject>
);
