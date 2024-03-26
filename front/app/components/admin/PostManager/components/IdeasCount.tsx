import React from 'react';

import styled from 'styled-components';

import useIdeasCount from 'api/idea_count/useIdeasCount';
import { IQueryParameters } from 'api/ideas/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

interface Props {
  project?: string | null;
  // We are using ideas, not ideas_count query parameter types.
  // This is because the IdeasCount component is used in the PostManager, which uses the ideas query parameter types.
  queryParameters: IQueryParameters;
}

const IdeasCount = ({ project, queryParameters }: Props) => {
  const { data: ideasCount } = useIdeasCount({
    phase: queryParameters.phase,
    topics: queryParameters.topics,
    search: queryParameters.search,
    assignee: queryParameters.assignee,
    feedback_needed: queryParameters.feedback_needed,
    idea_status_id: queryParameters.idea_status,
    projects: project ? [project] : undefined,
  });

  if (!ideasCount) return null;

  return (
    <Container>
      {/*
          If there are no ideas, we have an 'empty container' to indicate there are no ideas matching the filters.
          Hence we only show this count when there's at least 1 idea.
        */}
      {ideasCount.data.attributes.count > 0 &&
        (ideasCount.data.attributes.count === 1 ? (
          <FormattedMessage {...messages.oneInput} />
        ) : (
          <FormattedMessage
            {...messages.multipleInputs}
            values={{ ideaCount: ideasCount.data.attributes.count }}
          />
        ))}
    </Container>
  );
};

export default IdeasCount;
