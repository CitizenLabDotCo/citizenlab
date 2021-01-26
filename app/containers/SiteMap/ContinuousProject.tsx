import React from 'react';
import { IProjectData } from 'services/projects';
import Link from 'utils/cl-router/Link';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getInputTermMessage } from 'utils/i18n';

interface InputProps {
  project: IProjectData;
}

interface Props extends InputProps {}

const ContinuousProject = ({ project }: Props) => (
  <>
    {(project.attributes.participation_method === 'ideation' ||
      project.attributes.participation_method === 'budgeting') && (
      <li>
        <Link to={`/projects/${project.attributes.slug}/ideas`}>
          <FormattedMessage
            {...getInputTermMessage(project.attributes.input_term, {
              idea: messages.projectIdeas,
              option: messages.options,
              project: messages.projects,
              question: messages.questions,
              issue: messages.issues,
              contribution: messages.contributions,
            })}
          />
        </Link>
      </li>
    )}
    {project.attributes.participation_method === 'poll' && (
      <li>
        <Link to={`/projects/${project.attributes.slug}/poll`}>
          <FormattedMessage {...messages.projectPoll} />
        </Link>
      </li>
    )}
    {project.attributes.participation_method === 'survey' && (
      <li>
        <Link to={`/projects/${project.attributes.slug}/info`}>
          <FormattedMessage {...messages.projectSurvey} />
        </Link>
      </li>
    )}
  </>
);

export default ContinuousProject;
