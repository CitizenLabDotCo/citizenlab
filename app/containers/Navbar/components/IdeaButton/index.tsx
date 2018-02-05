import * as React from 'react';
import { browserHistory } from 'react-router';

import { postingButtonState } from 'services/ideaPostingRules';

import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

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
      <Button
        className="e2e-add-idea-button"
        text={<FormattedMessage {...messages.startIdea} />}
        style="primary"
        size="1"
        icon="plus-circle"
        linkTo="/ideas/new"
        circularCorners={true}
        disabled={!enabled}
      />
    );
  }
}

export default IdeaButton;
