import React from 'react';

import { isFunction } from 'lodash-es';
import { adopt } from 'react-adopt';
import GetInitiativesCount, {
  GetInitiativesCountChildProps,
} from 'resources/GetInitiativesCount';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

interface InputProps {
  assignee?: string | null;
  topics?: string[] | null;
  initiativeStatus?: string | null;
  feedbackNeeded: boolean;
  searchTerm?: string | null;
}

interface DataProps {
  initiativesCount: GetInitiativesCountChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

export class InitiativesCount extends React.PureComponent<Props, State> {
  componentDidUpdate(prevProps: Props) {
    if (prevProps.searchTerm !== this.props.searchTerm) {
      if (isFunction(this.props.initiativesCount.onChangeSearchTerm)) {
        this.props.initiativesCount.onChangeSearchTerm(this.props.searchTerm);
      }
    }
  }

  render() {
    const { initiativesCount } = this.props;
    const initiativesMatchingFiltersCount = initiativesCount.count;

    return (
      <Container>
        {/*
          If there are no initiatives, we have an 'empty container' to indicate there are no initiatives matching the filters.
          Hence we only show this count when there's at least 1 initiative.
        */}
        {!isNilOrError(initiativesMatchingFiltersCount) &&
          initiativesMatchingFiltersCount > 0 &&
          (initiativesMatchingFiltersCount === 1 ? (
            <FormattedMessage {...messages.oneInitiative} />
          ) : (
            <FormattedMessage
              {...messages.multipleInitiatives}
              values={{ initiativesCount: initiativesMatchingFiltersCount }}
            />
          ))}
      </Container>
    );
  }
}

const Data = adopt({
  initiativesCount: ({
    topics,
    initiativeStatus,
    assignee,
    feedbackNeeded,
    render,
  }) => {
    return (
      <GetInitiativesCount
        feedbackNeeded={feedbackNeeded === true ? true : undefined}
        assignee={assignee !== 'all' ? assignee : undefined} // TOCHECK
        topics={topics}
        initiativeStatusId={initiativeStatus}
      >
        {render}
      </GetInitiativesCount>
    );
  },
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps: DataProps) => (
      <InitiativesCount
        {...inputProps}
        initiativesCount={dataProps.initiativesCount}
      />
    )}
  </Data>
);
