import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { stateStream, IStateStream } from 'services/state';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import broadcast from 'services/broadcast';
import messages from './messages';
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

type Props = {
  intl: ReactIntl.InjectedIntl;
  tFunc: Function;
  locale: string;
  onSubmit: () => void;
};

export type State = {
  submitError: boolean;
  processing: boolean;
};

export const namespace = 'IdeasNewPage2/ButtonBar';

export default class ButtonBar extends React.PureComponent<Props, State> {
  public namespace: string;
  private state$: IStateStream<State>;
  private subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state$ = stateStream.observe<State>(namespace);
    this.subscriptions = [];
  }

  componentWillMount() {
    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnSubmit = () => {
    broadcast.emit(namespace, 'submit');
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
