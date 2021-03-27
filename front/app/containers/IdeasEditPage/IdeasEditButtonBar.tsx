import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import ButtonBar from 'components/ButtonBar';

// services
import {
  globalState,
  IGlobalStateService,
  IIdeasPageGlobalState,
} from 'services/globalState';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled from 'styled-components';

const ButtonBarInner = styled.div`
  width: 100%;
  max-width: 700px;
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

interface Props {
  form?: string;
  elementId?: string;
}

interface GlobalState {
  submitError: boolean;
  processing: boolean;
  fileOrImageError: boolean;
}

interface State extends GlobalState {}

export default class IdeasEditButtonBar extends PureComponent<Props, State> {
  globalState: IGlobalStateService<IIdeasPageGlobalState>;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      submitError: false,
      processing: false,
      fileOrImageError: false,
    };
    this.globalState = globalState.init<IIdeasPageGlobalState>('IdeasEditPage');
    this.subscriptions = [];
  }

  async componentDidMount() {
    const globalState$ = this.globalState.observable;

    this.subscriptions = [
      globalState$.subscribe(
        ({ submitError, processing, fileOrImageError }) => {
          this.setState({ submitError, processing, fileOrImageError });
        }
      ),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  handleOnSubmitButtonClick = () => {
    eventEmitter.emit('IdeaFormSubmitEvent');
  };

  getSubmitErrorMessage = () => {
    const { fileOrImageError, submitError } = this.state;

    if (submitError) {
      return <FormattedMessage {...messages.submitError} />;
    } else if (fileOrImageError) {
      return <FormattedMessage {...messages.fileUploadError} />;
    }

    return null;
  };

  render() {
    const { processing } = this.state;
    const { elementId } = this.props;
    let { form } = this.props;
    const submitErrorMessage = this.getSubmitErrorMessage();
    form = form || '';

    return (
      <ButtonBar>
        <ButtonBarInner>
          <Button
            id={elementId}
            form={form}
            className="e2e-submit-idea-form"
            processing={processing}
            text={<FormattedMessage {...messages.editedPostSave} />}
            onClick={this.handleOnSubmitButtonClick}
          />
          {submitErrorMessage && (
            <Error
              text={submitErrorMessage}
              marginTop="0px"
              showBackground={false}
              showIcon={true}
            />
          )}
        </ButtonBarInner>
      </ButtonBar>
    );
  }
}
