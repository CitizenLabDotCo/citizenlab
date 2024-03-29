import React from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import { isFunction } from 'lodash-es';
import { adopt } from 'react-adopt';
import GetIdeasCount, {
  GetIdeasCountChildProps,
} from 'resources/GetIdeasCount';
import GetInitiativesCount, {
  GetInitiativesCountChildProps,
} from 'resources/GetInitiativesCount';
import styled, { css } from 'styled-components';

import CountBadge from 'components/UI/CountBadge';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import { ManagerType } from '../..';
import messages from '../../messages';

const size = 21;
const padding = 4;

const Container = styled.div`
  display: inline-block;
  display: flex;
  align-items: center;
`;

const ToggleContainer = styled.div<{ checked: boolean }>`
  height: 100%;
  display: flex;
  align-items: center;

  ${(props) =>
    props.checked &&
    css`
      i {
        padding-right: ${padding}px !important;
        padding-left: ${size}px !important;
        background: ${colors.success} !important;
      }
    `};

  input {
    display: none;
  }

  i {
    display: inline-block;
    cursor: pointer;
    padding: ${padding}px;
    padding-right: ${size}px;
    transition: all ease 0.15s;
    border-radius: ${size + padding}px;
    background: #ccc;
    transform: translate3d(0, 0, 0);

    &:before {
      display: block;
      content: '';
      width: ${size}px;
      height: ${size}px;
      border-radius: ${size}px;
      background: #fff;
    }
  }
`;

const StyledLabel = styled.label`
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  line-height: 20px;
  padding-left: 10px;
  padding-right: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

interface InputProps {
  type: ManagerType;
  value: boolean;
  onChange: (feedbackNeeded: boolean | undefined) => void;
  assignee?: string | null;
  project?: string | null;
  phase?: string | null;
  topics?: string[] | null;
  status?: string | null;
  searchTerm?: string | null;
}

interface DataProps {
  feedbackNeededCount: GetIdeasCountChildProps | GetInitiativesCountChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

export class FeedbackToggle extends React.PureComponent<Props, State> {
  componentDidUpdate(prevProps: Props) {
    if (prevProps.searchTerm !== this.props.searchTerm) {
      if (isFunction(this.props.feedbackNeededCount.onChangeSearchTerm)) {
        this.props.feedbackNeededCount.onChangeSearchTerm(
          this.props.searchTerm || ''
        );
      }
    }
  }

  handleOnClick = () => {
    this.props.onChange(!this.props.value || undefined);
  };

  render() {
    const { value, feedbackNeededCount } = this.props;

    return (
      <Container
        id="e2e-feedback_needed_filter_toggle"
        className="feedback_needed_filter_toggle"
      >
        <ToggleContainer onClick={this.handleOnClick} checked={value}>
          <input type="checkbox" role="checkbox" aria-checked={value} />
          <i />
        </ToggleContainer>
        <StyledLabel onClick={this.handleOnClick}>
          <FormattedMessage {...messages.inputsNeedFeedbackToggle} />
          {!isNilOrError(feedbackNeededCount.count) && (
            <CountBadge count={feedbackNeededCount.count} />
          )}
        </StyledLabel>
      </Container>
    );
  }
}

const Data = adopt({
  feedbackNeededCount: ({
    project,
    phase,
    topics,
    status,
    assignee,
    render,
    type,
  }) => {
    const projectIds = project ? [project] : undefined;
    return type === 'Initiatives' ? (
      <GetInitiativesCount
        feedbackNeeded={true}
        assignee={assignee}
        topics={topics}
        initiativeStatusId={status}
      >
        {render}
      </GetInitiativesCount>
    ) : (
      <GetIdeasCount
        feedbackNeeded={true}
        assignee={assignee}
        projects={projectIds}
        phase={phase}
        topics={topics}
        ideaStatusId={status}
      >
        {render}
      </GetIdeasCount>
    );
  },
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps: DataProps) => (
      <FeedbackToggle {...inputProps} {...dataProps} />
    )}
  </Data>
);
