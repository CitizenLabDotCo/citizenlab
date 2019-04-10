import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// styles
import styled, { css } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// resources
import GetIdeasCount, { GetIdeasCountChildProps } from 'resources/GetIdeasCount';

// components
import CountBadge from 'components/UI/CountBadge';

const size = 21;
const padding = 4;

const Container = styled.div`
  display: inline-block;
  display: flex;
  align-items: center;
`;

const ToggleContainer: any = styled.div`
  height: 100%;
  display: flex;
  align-items: center;

  ${(props: any) => props.disabled && css`
    opacity: 0.25;

    i,
    i:before {
      cursor: not-allowed;
    }
  `};

  ${(props: any) => props.checked && css`
    i {
      padding-right: ${padding}px !important;
      padding-left: ${size}px !important;
      background: ${colors.clGreen} !important;
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
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: 20px;
  padding-left: 10px;
  padding-right: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

interface InputProps {
  value: boolean;
  onChange: () => void;
  assignee: string;
}

interface DataProps {
  feedbackNeededCount: GetIdeasCountChildProps;
}

interface Props extends InputProps, DataProps {}

type State = {};

export class FeedbackToggle extends React.PureComponent<Props, State> {
  handleOnClick = () => {
    this.props.onChange();
  }

  render() {
    const { value, feedbackNeededCount } = this.props;

    return (
      <Container className="feedback_needed_filter_toggle">
        <StyledLabel onClick={this.handleOnClick}>
          <FormattedMessage {...messages.anyFeedbackStatus} />
        </StyledLabel>
        <ToggleContainer onClick={this.handleOnClick} checked={value}>
          <input type="checkbox" role="checkbox" aria-checked={value}/>
          <i />
        </ToggleContainer>
        <StyledLabel onClick={this.handleOnClick}>
          <FormattedMessage {...messages.needFeedback} />
          {!isNilOrError(feedbackNeededCount.count) && <CountBadge count={feedbackNeededCount.count}/>}
        </StyledLabel>
      </Container>
    );
  }
}

const Data = adopt({
  ideasCount: ({ assignee, render }) => (
    <GetIdeasCount feedbackNeeded={true} assignee={assignee === 'all' ? undefined : assignee}>
      {render}
    </GetIdeasCount>
  )
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <FeedbackToggle {...inputProps} feedbackNeededCount={dataProps.ideasCount}/>}
  </Data>
);
