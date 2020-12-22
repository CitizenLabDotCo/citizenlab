import React from 'react';
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

type State = {};

export class IdeasCount extends React.PureComponent<Props, State> {
  componentDidUpdate(prevProps) {
    if (prevProps.searchTerm !== this.props.searchTerm) {
      if (isFunction(this.props.ideasCount.onChangeSearchTerm)) {
        this.props.ideasCount.onChangeSearchTerm(this.props.searchTerm);
      }
    }
  }

  render() {
    const { ideasCount } = this.props;
    const ideasMatchingFiltersCount = ideasCount.count;

    return (
      <Container>
        {/*
          If there are no ideas, we have an 'empty container' to indicate there are no ideas matching the filters.
          Hence we only show this count when there's at least 1 idea.
        */}
        {!isNilOrError(ideasMatchingFiltersCount) &&
          ideasMatchingFiltersCount > 0 &&
          (ideasMatchingFiltersCount === 1 ? (
            <FormattedMessage {...messages.oneInput} />
          ) : (
            <FormattedMessage
              {...messages.multipleInputs}
              values={{ ideaCount: ideasMatchingFiltersCount }}
            />
          ))}
      </Container>
    );
  }
}

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
    {(dataProps) => (
      <IdeasCount {...inputProps} ideasCount={dataProps.ideasCount} />
    )}
  </Data>
);
