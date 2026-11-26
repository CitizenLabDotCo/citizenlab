import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../messages';

interface Props {
  table: string;
  projectId?: string;
}

interface Source {
  name: MessageDescriptor;
  description: MessageDescriptor;
}

// What each reporting table holds, in the words an admin sees in the platform. A
// table with no entry here renders nothing: the whole point of this tab is that
// nobody has to read a table name to understand a chart.
const SOURCES: Record<string, Source | undefined> = {
  reporting_contributions: {
    name: messages.sourceContributions,
    description: messages.sourceContributionsDescription,
  },
  reporting_inputs: {
    name: messages.sourceInputs,
    description: messages.sourceInputsDescription,
  },
  reporting_input_phases: {
    name: messages.sourceInputPhases,
    description: messages.sourceInputPhasesDescription,
  },
  reporting_input_tags: {
    name: messages.sourceInputTags,
    description: messages.sourceInputTagsDescription,
  },
  reporting_input_question_answers: {
    name: messages.sourceInputQuestionAnswers,
    description: messages.sourceInputQuestionAnswersDescription,
  },
  reporting_input_votes: {
    name: messages.sourceInputVotes,
    description: messages.sourceInputVotesDescription,
  },
  reporting_input_reactions: {
    name: messages.sourceInputReactions,
    description: messages.sourceInputReactionsDescription,
  },
  reporting_comments: {
    name: messages.sourceComments,
    description: messages.sourceCommentsDescription,
  },
  reporting_users: {
    name: messages.sourceUsers,
    description: messages.sourceUsersDescription,
  },
  reporting_user_question_answers: {
    name: messages.sourceUserQuestionAnswers,
    description: messages.sourceUserQuestionAnswersDescription,
  },
  reporting_participants: {
    name: messages.sourceParticipants,
    description: messages.sourceParticipantsDescription,
  },
  reporting_events: {
    name: messages.sourceEvents,
    description: messages.sourceEventsDescription,
  },
  reporting_reference_distributions: {
    name: messages.sourceReferenceDistributions,
    description: messages.sourceReferenceDistributionsDescription,
  },
};

export const isKnownSource = (table: string) => !!SOURCES[table];

// The admin screen that shows this data. Several tables share one, which is why
// the destination is named separately from the source.
type Destination =
  | 'inputs'
  | 'participants'
  | 'demographics'
  | 'events'
  | 'users'
  | 'representativeness';

const DESTINATIONS: Record<string, Destination | undefined> = {
  reporting_contributions: 'participants',
  reporting_inputs: 'inputs',
  reporting_input_phases: 'inputs',
  reporting_input_tags: 'inputs',
  reporting_input_question_answers: 'inputs',
  reporting_input_votes: 'inputs',
  reporting_input_reactions: 'inputs',
  reporting_comments: 'inputs',
  reporting_users: 'users',
  reporting_user_question_answers: 'demographics',
  reporting_participants: 'participants',
  reporting_events: 'events',
  reporting_reference_distributions: 'representativeness',
};

// Dropped rather than guessed when the screen needs a project and the report is
// not about one.
const screenLink = (table: string, projectId?: string) => {
  switch (DESTINATIONS[table]) {
    case 'users':
      return (
        <Link to="/admin/users">
          <FormattedMessage {...messages.openUsers} />
        </Link>
      );
    case 'representativeness':
      return (
        <Link to="/admin/dashboard/representation">
          <FormattedMessage {...messages.openRepresentativeness} />
        </Link>
      );
    // The input manager takes no project in its URL, so this one link is the only
    // one that cannot be narrowed to the report's project.
    case 'inputs':
      return (
        <Link to="/admin/ideas">
          <FormattedMessage {...messages.openInputs} />
        </Link>
      );
    case 'participants':
      return projectId ? (
        <Link to="/admin/projects/$projectId/audience" params={{ projectId }}>
          <FormattedMessage {...messages.openParticipants} />
        </Link>
      ) : null;
    case 'demographics':
      return projectId ? (
        <Link
          to="/admin/projects/$projectId/audience/demographics"
          params={{ projectId }}
        >
          <FormattedMessage {...messages.openDemographics} />
        </Link>
      ) : null;
    case 'events':
      return projectId ? (
        <Link to="/admin/projects/$projectId/events" params={{ projectId }}>
          <FormattedMessage {...messages.openEvents} />
        </Link>
      ) : null;
    default:
      return null;
  }
};

// One row: what the chart read, what it holds, and the screen that shows it.
const DataSource = ({ table, projectId }: Props) => {
  const source = SOURCES[table];
  if (!source) return null;

  const link = screenLink(table, projectId);

  return (
    <Box display="flex" gap="8px">
      <Box flex="0 0 18px" mt="3px">
        <Icon
          name="page"
          width="18px"
          height="18px"
          fill={colors.textSecondary}
        />
      </Box>
      <Box>
        <Text m="0" fontWeight="semi-bold">
          <FormattedMessage {...source.name} />
        </Text>
        <Text variant="boHelper" m="0">
          <FormattedMessage {...source.description} />
        </Text>
        {link && (
          <Text variant="boHelper" m="0" mt="2px">
            {link}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default DataSource;
