import React, { PureComponent } from 'react';
import Modal from 'components/UI/Modal';
import { Subscription } from 'rxjs';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// utils
import eventEmitter from 'utils/eventEmitter';
import events, { StatusChangeModalOpen } from '../../events';

interface Props {}

interface State {
  initiativeId: string | null;
  newStatusId: string | null;
}

class StatusChangeModal extends PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      initiativeId: null,
      newStatusId: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      eventEmitter.observeEvent<StatusChangeModalOpen>(events.statusChangeModalOpen).subscribe(({ eventValue }) => {
        console.log(eventValue);
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { intl: { formatMessage } } = this.props;
    const { initiativeId } = this.state;
    return (
      <Modal
        opened={!!initiativeId}
        close={close}
        label={formatMessage(messages.changeStatusModalLabel)}
        header={<FormattedMessage {...messages.changeStatusModalTitle} />}
      >
        "Hi"
      </Modal>
    );
  }

}

export default injectIntl(StatusChangeModal);
