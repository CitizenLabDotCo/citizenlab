import * as React from 'react';
import { browserHistory } from 'react-router';
import { postingButtonState } from 'services/ideaPostingRules';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import styled from 'styled-components';

const StyledButton = styled(Button)`
  .Button {
    background: #fff !important;
    border: solid 2px #eaeaea !important;

    &:hover {
      /* border-color: ${(props) => props.theme.colorMain} !important; */
      border-color: #ccc !important;
    }
  }
`;

type Props = {};

type State = {};

class IdeaButton extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props as any);
  }

  handleOnAddIdeaClick = () => {
    browserHistory.push('/ideas/new');
  }

  render() {
    const { show, enabled } = postingButtonState({});

    if (!show) return null;

    return (
      <StyledButton
        className="e2e-add-idea-button"
        text={<FormattedMessage {...messages.startIdea} />}
        style="primary-outlined"
        size="1"
        linkTo="/ideas/new"
        circularCorners={false}
        disabled={!enabled}
      />
    );
  }
}

export default IdeaButton;
