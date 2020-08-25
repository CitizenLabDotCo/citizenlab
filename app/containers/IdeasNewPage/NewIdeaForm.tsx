import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';

// components
import IdeaForm, { IIdeaFormOutput } from 'components/IdeaForm';

// services
import {
  globalState,
  IGlobalStateService,
  IIdeasPageGlobalState,
} from 'services/globalState';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { UploadFile } from 'typings';

// style
import { media, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  max-width: 700px;
  display: 'flex';
  flex-direction: column;
  align-items: center;
  padding-bottom: 100px;
  padding-right: 20px;
  padding-left: 20px;
  margin-left: auto;
  margin-right: auto;

  ${media.smallerThanMaxTablet`
    padding-bottom: 80px;
    padding-right: 0;
    padding-left: 0;
  `}
`;

const Title = styled.h1`
  color: #333;
  font-size: ${fontSizes.xxxxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 60px;
  padding-bottom: 40px;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
    line-height: 34px;
  `}
`;

interface Props {
  onSubmit: () => void;
  projectId: string;
}

interface GlobalState {
  title: string | null;
  description: string | null;
  selectedTopics: string[];
  budget: number | null;
  proposedBudget: number | null;
  position: string;
  imageFile: UploadFile[];
  submitError: boolean;
  processing: boolean;
  fileOrImageError: boolean;
}

interface State extends GlobalState {}

export default class NewIdeaForm extends PureComponent<Props, State> {
  globalState: IGlobalStateService<IIdeasPageGlobalState>;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      title: null,
      description: null,
      selectedTopics: [],
      budget: null,
      proposedBudget: null,
      position: '',
      imageFile: [],
      submitError: false,
      processing: false,
      fileOrImageError: false,
    };
    this.globalState = globalState.init('IdeasNewPage');
    this.subscriptions = [];
  }

  componentDidMount() {
    const globalState$ = this.globalState.observable;

    this.subscriptions = [
      globalState$.subscribe(
        ({
          title,
          description,
          selectedTopics,
          budget,
          proposedBudget,
          position,
          imageFile,
          submitError,
          processing,
          fileOrImageError,
        }) => {
          const newState: State = {
            title,
            description,
            selectedTopics,
            budget,
            proposedBudget,
            position,
            imageFile,
            submitError,
            processing,
            fileOrImageError,
          };

          this.setState(newState);
        }
      ),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  handleIdeaFormOutput = async (ideaFormOutput: IIdeaFormOutput) => {
    const {
      title,
      description,
      selectedTopics,
      budget,
      proposedBudget,
      address: position,
      imageFile,
      ideaFiles,
    } = ideaFormOutput;
    this.globalState.set({
      title,
      description,
      selectedTopics,
      budget,
      proposedBudget,
      position,
      imageFile,
      ideaFiles,
    });
    this.props.onSubmit();
  };

  render() {
    const {
      title,
      description,
      selectedTopics,
      budget,
      proposedBudget,
      position,
      imageFile,
    } = this.state;
    const { projectId } = this.props;

    return (
      <Container id="e2e-new-idea-form">
        <Title className="e2e-idea-form-title">
          <FormattedMessage {...messages.formTitle} />
        </Title>

        <IdeaForm
          projectId={projectId}
          title={title}
          description={description}
          selectedTopics={selectedTopics}
          budget={budget}
          proposedBudget={proposedBudget}
          address={position}
          imageFile={imageFile}
          onSubmit={this.handleIdeaFormOutput}
        />
      </Container>
    );
  }
}
