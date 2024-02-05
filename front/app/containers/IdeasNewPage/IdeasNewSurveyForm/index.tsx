import React from 'react';
import IdeasNewForm from "../IdeasNewForm";
import {IProject} from "api/projects/types";

interface Props {
  project: IProject;
}

const IdeasNewSurveyForm = ({ project }: Props) => {
  console.log('SURVEY FORM');
  return <IdeasNewForm project={project} />;
}
export default IdeasNewSurveyForm;
