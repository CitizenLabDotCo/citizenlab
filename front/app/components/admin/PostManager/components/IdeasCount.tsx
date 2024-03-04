import React from 'react';

import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

import { IQueryParameters } from 'api/idea_count/types';
import useIdeasCount from 'api/idea_count/useIdeasCount';

import messages from '../messages';

s;

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

interface Props extends Omit<IQueryParameters, 'projectIds'> {
  project?: string | null;
  feedbackNeeded?: boolean;
  ideaStatusId?: string;
}

const IdeasCount = ({
  project,
  ideaStatusId,
  feedbackNeeded,
  ...otherProps
}: Props) => {
  const { data: ideasCount } = useIdeasCount({
    ...otherProps,
    feedback_needed: feedbackNeeded,
    idea_status_id: ideaStatusId,
    projects: project ? [project] : undefined,
  });

  return (
    <Container>
      {/*
          If there are no ideas, we have an 'empty container' to indicate there are no ideas matching the filters.
          Hence we only show this count when there's at least 1 idea.
        */}
      {ideasCount &&
        ideasCount.data.attributes.count > 0 &&
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
