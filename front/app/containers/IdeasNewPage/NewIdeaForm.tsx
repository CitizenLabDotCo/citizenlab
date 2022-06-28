import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { Subscription } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';

// components
import IdeaForm, { IIdeaFormOutput } from 'components/IdeaForm';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';

// services
import {
  globalState,
  IGlobalStateService,
  IIdeasPageGlobalState,
} from 'services/globalState';
import { getInputTerm } from 'services/participationContexts';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getInputTermMessage } from 'utils/i18n';

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
  color: ${({ theme }) => theme.colorText};
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

interface InputProps {
  onSubmit: () => void;
  projectId: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

interface DataProps {
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
}

interface Props extends InputProps, DataProps {}

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
  titleProfanityError: boolean;
  descriptionProfanityError: boolean;
  authorId: string | null;
}

interface State extends GlobalState {}

class NewIdeaForm extends PureComponent<Props, State> {
  globalState: IGlobalStateService<IIdeasPageGlobalState>;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      title: null,
      authorId: null,
      description: null,
      selectedTopics: [],
      budget: null,
      proposedBudget: null,
      position: '',
      imageFile: [],
      submitError: false,
      processing: false,
      fileOrImageError: false,
      titleProfanityError: false,
      descriptionProfanityError: false,
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
          titleProfanityError,
          descriptionProfanityError,
          authorId,
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
            titleProfanityError,
            descriptionProfanityError,
            authorId,
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
      authorId,
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
      authorId,
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
      titleProfanityError,
      descriptionProfanityError,
      authorId,
    } = this.state;
    const { projectId, project, phases, onTitleChange, onDescriptionChange } =
      this.props;

    if (!isNilOrError(project)) {
      const inputTerm = getInputTerm(
        project.attributes.process_type,
        project,
        phases
      );

      return (
        <Container id="e2e-new-idea-form">
          <Title className="e2e-idea-form-title">
            <FormattedMessage
              {...getInputTermMessage(inputTerm, {
                idea: messages.ideaFormTitle,
                option: messages.optionFormTitle,
                project: messages.projectFormTitle,
                question: messages.questionFormTitle,
                issue: messages.issueFormTitle,
                contribution: messages.contributionFormTitle,
              })}
            />
          </Title>

          <IdeaForm
            authorId={authorId}
            projectId={projectId}
            title={title}
            description={description}
            selectedTopics={selectedTopics}
            budget={budget}
            proposedBudget={proposedBudget}
            address={position}
            imageFile={imageFile}
            hasTitleProfanityError={titleProfanityError}
            hasDescriptionProfanityError={descriptionProfanityError}
            onSubmit={this.handleIdeaFormOutput}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
          />
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  phases: ({ projectId, render }) => (
    <GetPhases projectId={projectId}>{render}</GetPhases>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <NewIdeaForm {...inputProps} {...dataProps} />}
  </Data>
);
