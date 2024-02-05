import React from 'react';
import IdeasNewForm from "../IdeasNewForm";
import {IProject} from "api/projects/types";

interface Props {
  project: IProject;
}

const IdeasNewIdeationForm = ({ project }: Props) => {
  console.log('IDEATION FORM');
  return <IdeasNewForm project={project} />;
}
export default IdeasNewIdeationForm;
