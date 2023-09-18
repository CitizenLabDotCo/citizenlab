import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// utils
import eventEmitter from 'utils/eventEmitter';
import events, { StatusChangeModalOpen } from '../../events';

// components
import Modal from 'components/UI/Modal';
import StatusChangeFormWrapper from './StatusChangeFormWrapper';

export interface Props {}

interface State {
  initiativeId: string | null;
  newStatusId: string | null;
  feedbackRequired?: boolean;
}

class StatusChangeModal extends PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      initiativeId: null,
      newStatusId: null,
      feedbackRequired: false,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      eventEmitter
        .observeEvent<StatusChangeModalOpen>(events.statusChangeModalOpen)
        .subscribe(
          ({ eventValue: { initiativeId, newStatusId, feedbackRequired } }) => {
            this.setState({ initiativeId, newStatusId, feedbackRequired });
          }
        ),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  close = () => {
    this.setState({ initiativeId: null, newStatusId: null });
  };

  render() {
    const { initiativeId, newStatusId, feedbackRequired } = this.state;

    return (
      <Modal
        opened={!!(initiativeId && newStatusId)}
        close={this.close}
        closeOnClickOutside={false}
        header={<FormattedMessage {...messages.changeStatusModalTitle} />}
      >
        {!!(initiativeId && newStatusId) && (
          <StatusChangeFormWrapper
            initiativeId={initiativeId}
            newStatusId={newStatusId}
            feedbackRequired={feedbackRequired}
            closeModal={this.close}
          />
        )}
      </Modal>
    );
  }
}

export default StatusChangeModal;
