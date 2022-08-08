import React, { useEffect } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { isFunction } from 'lodash-es';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// styles
import styled from 'styled-components';

// resources
import GetIdeasCount, {
  GetIdeasCountChildProps,
} from 'resources/GetIdeasCount';

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

interface InputProps {
  assignee?: string | null;
  project?: string | null;
  phase?: string | null;
  topics?: string[] | null;
  ideaStatus?: string | null;
  feedbackNeeded: boolean;
  searchTerm?: string | null;
}

interface DataProps {
  ideasCount: GetIdeasCountChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeasCount = ({
  ideasCount: { onChangeSearchTerm, count },
  searchTerm,
}: Props) => {
  useEffect(() => {
    if (isFunction(onChangeSearchTerm)) {
      onChangeSearchTerm(searchTerm);
    }
  }, [searchTerm, onChangeSearchTerm]);

  return (
    <Container>
      {/*
          If there are no ideas, we have an 'empty container' to indicate there are no ideas matching the filters.
          Hence we only show this count when there's at least 1 idea.
        */}
      {!isNilOrError(count) &&
        count > 0 &&
        (count === 1 ? (
          <FormattedMessage {...messages.oneInput} />
        ) : (
          <FormattedMessage
            {...messages.multipleInputs}
            values={{ ideaCount: count }}
          />
        ))}
    </Container>
  );
};

const Data = adopt({
  ideasCount: ({
    project,
    phase,
    topics,
    ideaStatus,
    assignee,
    feedbackNeeded,
    render,
  }) => {
    const projectIds = [project];

    return (
      <GetIdeasCount
        feedbackNeeded={feedbackNeeded === true ? true : undefined}
        assignee={assignee !== 'all' ? assignee : undefined}
        projectIds={projectIds}
        phaseId={phase}
        topics={topics}
        ideaStatusId={ideaStatus}
      >
        {render}
      </GetIdeasCount>
    );
  },
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps: DataProps) => (
      <IdeasCount {...inputProps} ideasCount={dataProps.ideasCount} />
    )}
  </Data>
);
