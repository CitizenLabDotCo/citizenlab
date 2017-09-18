import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';

// services
import { localeStream } from 'services/locale';

// i18n
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ButtonBarInner = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
  padding-right: 30px;
  padding-left: 30px;

  .Button {
    margin-right: 10px;
  }

  .Error {
    flex: 1;
  }
`;

type Props = {};

type State = {
  locale: string | null;
  submitError: boolean;
  processing: boolean;
};

class ButtonBar extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      locale: null,
      submitError: false,
      processing: false
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;

    this.subscriptions = [
      locale$.subscribe(locale => this.setState({ locale }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnSubmit = () => {
    eventEmitter.emit(namespace, 'submit', null);
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { processing, submitError } = this.state;
    const submitErrorMessage = (submitError ? formatMessage(messages.submitError) : null);

    return (
      <Container>
        <ButtonBarInner>
          <Button
            size="2"
            loading={processing}
            text={formatMessage(messages.submit)}
            onClick={this.handleOnSubmit}
          />
          <Error text={submitErrorMessage} marginTop="0px" showBackground={false} showIcon={true} />
        </ButtonBarInner>
      </Container>
    );
  }
}

export default injectIntl<Props>(ButtonBar);
