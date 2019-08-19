import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// utils
import eventEmitter from 'utils/eventEmitter';
import events, { StatusChangeModalOpen } from '../../events';

// components
import Modal from 'components/UI/Modal';
import StatusChangeForm from './StatusChangeForm';

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
      eventEmitter.observeEvent<StatusChangeModalOpen>(events.statusChangeModalOpen).subscribe(({ eventValue: { initiativeId,  newStatusId } }) => {
        this.setState({ initiativeId, newStatusId });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  close = () => {
    this.setState({ initiativeId: null, newStatusId: null });
  }

  render() {
    const { intl: { formatMessage } } = this.props;
    const { initiativeId, newStatusId } = this.state;

    return (
      <Modal
        opened={!!initiativeId && !!newStatusId}
        close={this.close}
        label={formatMessage(messages.changeStatusModalLabel)}
        // header={<FormattedMessage {...messages.changeStatusModalTitle} />}
      >
        {!!initiativeId && !!newStatusId &&
          <StatusChangeForm
            {... { initiativeId, newStatusId }}
          />
        }
      </Modal>
    );
  }

}

export default injectIntl(StatusChangeModal);
