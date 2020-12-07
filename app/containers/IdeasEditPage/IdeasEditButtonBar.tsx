import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { Subscription } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';

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

// resource
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getInputTermMessage } from 'utils/i18n';

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

interface InputProps {
  form?: string;
  elementId?: string;
  projectId: string;
}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

interface GlobalState {
  submitError: boolean;
  processing: boolean;
  fileOrImageError: boolean;
}

interface State extends GlobalState {}

class IdeasEditButtonBar extends PureComponent<Props, State> {
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
    const { project } = this.props;

    if (submitError) {
      return <FormattedMessage {...messages.submitError} />;
    } else if (fileOrImageError && !isNilOrError(project)) {
      const projectInputTerm = project.attributes.input_term;

      return (
        <FormattedMessage
          {...getInputTermMessage(projectInputTerm, {
            idea: messages.fileOrImageError,
          })}
        />
      );
    }

    return null;
  };

  render() {
    const { processing } = this.state;
    const { elementId, project } = this.props;
    let { form } = this.props;
    const submitErrorMessage = this.getSubmitErrorMessage();
    form = form || '';

    if (!isNilOrError(project)) {
      return (
        <ButtonBar>
          <ButtonBarInner>
            <Button
              id={elementId}
              form={form}
              className="e2e-submit-idea-form"
              processing={processing}
              text={<FormattedMessage {...messages.submit} />}
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

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId }) => <GetProject projectId={projectId} />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeasEditButtonBar {...inputProps} {...dataProps} />}
  </Data>
);
