import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import IdeaForm, { IIdeaFormOutput } from 'components/IdeaForm';

// services
import { globalState, IGlobalStateService, IIdeasNewPageGlobalState } from 'services/globalState';

// utils
import { IStream } from 'utils/streams';
import eventEmitter from 'utils/eventEmitter';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { IOption, ImageFile } from 'typings';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  max-width: 600px;
  display: 'flex';
  flex-direction: column;
  align-items: center;
  padding-bottom: 100px;
  padding-right: 30px;
  padding-left: 30px;
  margin-left: auto;
  margin-right: auto;

  ${media.smallerThanMaxTablet`
    padding-bottom: 80px;
  `}
`;

const Title = styled.h2`
  width: 100%;
  color: #333;
  font-size: 36px;
  line-height: 42px;
  font-weight: 500;
  text-align: center;
  padding-top: 40px;
  margin-bottom: 40px;
`;

const MobileButton = styled.div`
  width: 100%;
  display: none;

  .Button {
    margin-right: 10px;
  }

  .Error {
    flex: 1;
  }

  ${media.smallerThanMaxTablet`
    display: flex;
  `}
`;

interface Props {
  onSubmit: () => void;
}

interface GlobalState {
  title: string | null;
  description: string | null;
  selectedTopics: IOption[] | null;
  selectedProject: IOption | null;
  location: string;
  imageFile: ImageFile[] | null;
  submitError: boolean;
  processing: boolean;
}

interface State extends GlobalState {}

export default class NewIdeaForm extends React.PureComponent<Props, State> {
  globalState: IGlobalStateService<IIdeasNewPageGlobalState>;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.globalState = globalState.init('IdeasNewPage');
    this.subscriptions = [];
  }

  componentWillMount() {
    const globalState$ = this.globalState.observable;

    this.subscriptions = [
      globalState$.subscribe(({
        title,
        description,
        selectedTopics,
        selectedProject,
        location,
        imageFile,
        submitError,
        processing
      }) => {
        const newState: State = {
          title,
          description,
          selectedTopics,
          selectedProject,
          location,
          imageFile,
          submitError,
          processing
        };

        this.setState(newState);
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnSubmitButtonClick = () => {
    eventEmitter.emit('IdeasNewPage', 'IdeaFormSubmitEvent', null);
  }

  handleIdeaFormOutput = async (ideaFormOutput: IIdeaFormOutput) => {
    const { imageFile: oldImageFile } = await this.globalState.get();
    const { title, description, selectedTopics, selectedProject, location, imageFile } = ideaFormOutput;
    const oldBase64Image = (oldImageFile && oldImageFile.length > 0 && oldImageFile[0].base64 ? oldImageFile[0].base64 : null);
    const newBase64Image = (imageFile && imageFile.length > 0 && imageFile[0].base64 ? imageFile[0].base64 : null);
    const imageChanged = (oldBase64Image !== newBase64Image);
    this.globalState.set({ title, description, selectedTopics, selectedProject, location, imageFile, imageChanged });
    this.props.onSubmit();
  }

  render() {
    if (!this.state) { return null; }

    const { title, description, selectedTopics, selectedProject, location, imageFile, submitError, processing } = this.state;
    const submitErrorMessage = (submitError ? <FormattedMessage {...messages.submitError} /> : null);

    return (
      <Container id="e2e-new-idea-form">
        <Title>
          <FormattedMessage {...messages.formTitle} />
        </Title>

        <IdeaForm 
          title={title}
          description={description}
          selectedTopics={selectedTopics}
          selectedProject={selectedProject}
          location={location}
          imageFile={imageFile}
          onSubmit={this.handleIdeaFormOutput}
        />

        <MobileButton>
          <Button
            className="e2e-submit-idea-form"
            size="2"
            processing={processing}
            text={<FormattedMessage {...messages.submit} />}
            onClick={this.handleOnSubmitButtonClick}
          />
          <Error text={submitErrorMessage} marginTop="0px" />
        </MobileButton>
      </Container>
    );
  }
}
