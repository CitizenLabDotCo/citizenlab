import React, { PureComponent } from 'react';
import { Subscription, combineLatest, of, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { withRouter, WithRouterProps } from 'react-router';
import { has } from 'lodash-es';
import shallowCompare from 'utils/shallowCompare';

// libraries
import scrollToComponent from 'react-scroll-to-component';
import bowser from 'bowser';

// components
import Input from 'components/UI/Input';
import LocationInput from 'components/UI/LocationInput';
import QuillEditor from 'components/UI/QuillEditor';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import Error from 'components/UI/Error';
import HasPermission from 'components/HasPermission';
import FileUploader from 'components/UI/FileUploader';
import FeatureFlag from 'components/FeatureFlag';
import { FormLabel } from 'components/UI/FormComponents';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { topicsStream, ITopics, ITopicData } from 'services/topics';
import { projectByIdStream, IProjects, IProject, IProjectData } from 'services/projects';
import { phasesStream, IPhaseData } from 'services/phases';

// utils
import eventEmitter from 'utils/eventEmitter';
import { getLocalized } from 'utils/i18n';
import { pastPresentOrFuture } from 'utils/dateUtils';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { IOption, UploadFile, Locale } from 'typings';

// style
import styled from 'styled-components';
import { hideVisually } from 'polished';
import TopicsPicker from 'components/UI/TopicsPicker';
import { FormLabelWithIcon } from 'components/UI/FormComponents/WithIcons';

const Form = styled.form`
  width: 100%;
  display: 'flex';
  flex-direction: column;
  align-items: center;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

const StyledTopicsPicker = styled(TopicsPicker)`
  padding: 20px;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px #e0e0e0;
`;

const HiddenLabel = styled.span`
  ${hideVisually()}
`;

export interface IIdeaFormOutput {
  title: string;
  description: string;
  selectedTopics: string[];
  address: string;
  budget: number | null;
  imageFile: UploadFile[];
  ideaFiles: UploadFile[];
  ideaFilesToRemove: UploadFile[];
}

interface Props {
  projectId: string | null;
  title: string | null;
  description: string | null;
  selectedTopics: string[];
  budget: number | null;
  address: string;
  imageFile: UploadFile[];
  onSubmit: (arg: IIdeaFormOutput) => void;
  remoteIdeaFiles?: UploadFile[] | null;
}

interface State {
  tenant: ITenant | null;
  topics: IOption[] | null;
  pbContext: IProjectData | IPhaseData | null;
  projects: IOption[] | null;
  title: string;
  titleError: string | JSX.Element | null;
  description: string;
  descriptionError: string | JSX.Element | null;
  selectedTopics: string[];
  budget: number | null;
  budgetError: string | JSX.Element | null;
  address: string;
  imageFile: UploadFile[];
  ideaFiles: UploadFile[];
  ideaFilesToRemove: UploadFile[];
}

class IdeaForm extends PureComponent<Props & InjectedIntlProps & WithRouterProps, State> {
  subscriptions: Subscription[];
  titleInputElement: HTMLInputElement | null;
  descriptionElement: any;

  constructor(props) {
    super(props);
    this.state = {
      tenant: null,
      topics: null,
      pbContext: null,
      projects: null,
      title: '',
      titleError: null,
      description: '',
      descriptionError: null,
      selectedTopics: [],
      address: '',
      imageFile: [],
      budget: null,
      budgetError: null,
      ideaFiles: [],
      ideaFilesToRemove: []
    };
    this.subscriptions = [];
    this.titleInputElement = null;
    this.descriptionElement = null;
  }

  componentDidMount() {
    const { projectId } = this.props;
    const locale$ = localeStream().observable;
    const tenant$ = currentTenantStream().observable;
    const topics$ = topicsStream().observable;
    const project$: Observable<IProject | null> = (projectId ? projectByIdStream(projectId).observable : of(null));
    const pbContext$: Observable<IProjectData | IPhaseData | null> = project$.pipe(
      switchMap((project) => {
        if (project) {
          if (project.data.attributes.participation_method === 'budgeting') {
            return of(project.data);
          }

          if (project.data.attributes.process_type === 'timeline') {
            return phasesStream(project.data.id).observable.pipe(
              map((phases) => {
                const pbPhase = phases.data.find(phase => phase.attributes.participation_method === 'budgeting');
                return pbPhase || null;
              })
            );
          }
        }

        return of(null) as Observable<any>;
      })
    );

    this.updateState();

    this.subscriptions = [
      combineLatest(
        locale$,
        tenant$,
        topics$,
        pbContext$
      ).subscribe(([locale, tenant, topics, pbContext]) => {
        const tenantLocales = tenant.data.attributes.settings.core.locales;

        this.setState({
          tenant,
          pbContext,
          topics: this.getOptions(topics, locale, tenantLocales)
        });
      }),

      eventEmitter.observeEvent('IdeaFormSubmitEvent').subscribe(this.handleOnSubmit),
    ];

    if (!bowser.mobile && this.titleInputElement !== null) {
      setTimeout(() => (this.titleInputElement as HTMLInputElement).focus(), 50);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (!shallowCompare(prevProps, this.props)) {
      this.updateState();
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  updateState = () => {
    const { title, description, selectedTopics, address, budget, imageFile, remoteIdeaFiles } = this.props;
    const ideaFiles = Array.isArray(remoteIdeaFiles) ? remoteIdeaFiles : [];

    this.setState({
      selectedTopics,
      budget,
      imageFile,
      ideaFiles,
      address,
      title: (title || ''),
      description: (description || '')
    });
  }

  getOptions = (list: ITopics | IProjects | null, locale: Locale | null, currentTenantLocales: Locale[]) => {
    if (list && locale) {
      return (list.data as (ITopicData | IProjectData)[]).map(item => ({
        value: item.id,
        label: getLocalized(item.attributes.title_multiloc, locale, currentTenantLocales)
      } as IOption));
    }

    return null;
  }

  handleTitleOnChange = (title: string) => {
    this.setState({
      title,
      titleError: null
    });
  }

  handleDescriptionOnChange = async (description: string) => {
    const isDescriptionEmpty = (!description || description === '');

    this.setState(({ descriptionError }) => ({
      description,
      descriptionError: (isDescriptionEmpty ? descriptionError : null)
    }));
  }

  handleTopicsOnChange = (selectedTopics: string[]) => {
    this.setState({ selectedTopics });
  }

  handleLocationOnChange = (address: string) => {
    this.setState({ address });
  }

  handleUploadOnAdd = (imageFile: UploadFile) => {
    this.setState({
      imageFile: [imageFile]
    });
  }

  handleUploadOnRemove = () => {
    this.setState({
      imageFile: []
    });
  }

  handleBudgetOnChange = (budget: string) => {
    this.setState({
      budget: Number(budget),
      budgetError: null
    });
  }

  handleTitleInputSetRef = (element: HTMLInputElement) => {
    this.titleInputElement = element;
  }

  handleDescriptionSetRef = (element) => {
    this.descriptionElement = element;
  }

  validateTitle = (title: string | null) => {
    if (!title) {
      return <FormattedMessage {...messages.titleEmptyError} />;
    }

    if (title && title.length < 10) {
      return <FormattedMessage {...messages.titleLengthError} />;
    }

    return null;
  }

  validateDescription = (description: string | null) => {
    if (!description) {
      return <FormattedMessage {...messages.descriptionEmptyError} />;
    }

    if (description && description.length < 30) {
      return <FormattedMessage {...messages.descriptionLengthError} />;
    }

    return null;
  }

  validate = (title: string | null, description: string | null, budget: number | null) => {
    const { pbContext } = this.state;
    const titleError = this.validateTitle(title);
    const descriptionError = this.validateDescription(description);
    const pbMaxBudget = (pbContext && pbContext.attributes.max_budget ? pbContext.attributes.max_budget : null);
    let budgetError: JSX.Element | null = null;

    if (pbContext) {
      if (budget === null && (pbContext.type === 'project' || (pbContext.type === 'phase' && pastPresentOrFuture([(pbContext as IPhaseData).attributes.start_at, (pbContext as IPhaseData).attributes.end_at]) === 'present'))) {
        budgetError = <FormattedMessage {...messages.noBudgetError} />;
      } else if (budget === 0) {
        budgetError = <FormattedMessage {...messages.budgetIsZeroError} />;
      } else if (pbMaxBudget && budget && budget > pbMaxBudget) {
        budgetError = <FormattedMessage {...messages.budgetIsTooBig} />;
      }
    }

    this.setState({ titleError, descriptionError, budgetError });

    if (titleError && this.titleInputElement) {
      scrollToComponent(this.titleInputElement, { align: 'top', offset: -240, duration: 300 });
      setTimeout(() => this.titleInputElement && this.titleInputElement.focus(), 300);
    } else if (descriptionError && has(this.descriptionElement, 'editor.root')) {
      scrollToComponent(this.descriptionElement.editor.root, { align: 'top', offset: -200, duration: 300 });
      setTimeout(() => this.descriptionElement.editor.root.focus(), 300);
    }

    if (!pbContext) {
      return (!titleError && !descriptionError);
    }

    return (!titleError && !descriptionError && !budgetError);
  }

  handleIdeaFileOnAdd = (ideaFileToAdd: UploadFile) => {
    this.setState(({ ideaFiles }) => ({
      ideaFiles: [
        ...ideaFiles,
        ideaFileToAdd
      ]
    }));
  }

  handleIdeaFileOnRemove = (ideaFileToRemove: UploadFile) => {
    this.setState(({ ideaFiles, ideaFilesToRemove }) => ({
      ideaFiles: ideaFiles.filter(ideaFile => ideaFile.base64 !== ideaFileToRemove.base64),
      ideaFilesToRemove: [
        ...ideaFilesToRemove,
        ideaFileToRemove
      ]
    }));
  }

  handleOnSubmit = () => {
    const { title, description, selectedTopics, address, budget, imageFile, ideaFiles, ideaFilesToRemove } = this.state;
    const formIsValid = this.validate(title, description, budget);

    if (formIsValid) {
      const output: IIdeaFormOutput = {
        title,
        selectedTopics,
        address,
        imageFile,
        budget,
        description,
        ideaFiles,
        ideaFilesToRemove
      };

      this.props.onSubmit(output);
    }
  }

  render() {
    const className = this.props['className'];
    const { projectId } = this.props;
    const { formatMessage } = this.props.intl;
    const {
      tenant,
      topics,
      pbContext,
      title,
      description,
      selectedTopics,
      address,
      budget,
      imageFile,
      titleError,
      descriptionError,
      budgetError,
      ideaFiles
    } = this.state;
    const tenantCurrency = (tenant ? tenant.data.attributes.settings.core.currency : '');

    return (
      <Form id="idea-form" className={className}>
        <FormElement id="e2e-idea-title-input">
          <FormLabel labelMessage={messages.titleLabel} htmlFor="title" />
          <Input
            id="title"
            type="text"
            value={title}
            placeholder={formatMessage(messages.titlePlaceholder)}
            error={titleError}
            onChange={this.handleTitleOnChange}
            setRef={this.handleTitleInputSetRef}
            maxCharCount={80}
          />
        </FormElement>

        <FormElement id="e2e-idea-description-input">
          <FormLabel labelMessage={messages.descriptionLabel} htmlFor="editor" />
          <QuillEditor
            id="editor"
            noImages={true}
            value={description}
            placeholder={formatMessage(messages.descriptionPlaceholder)}
            onChange={this.handleDescriptionOnChange}
            setRef={this.handleDescriptionSetRef}
            hasError={descriptionError !== null}
          />
          {descriptionError && <Error text={descriptionError} />}
        </FormElement>

        {topics && topics.length > 0 && (
          <FormElement>
            <FormLabel labelMessage={messages.topicsLabel} htmlFor="topics" />
            <StyledTopicsPicker
              value={selectedTopics}
              onChange={this.handleTopicsOnChange}
              max={2}
            />
          </FormElement>
        )}

        <FormElement>
          <FormLabel labelMessage={messages.locationLabel} htmlFor="location" />
          <LocationInput
            id="location"
            className="e2e-idea-form-location-input-field"
            value={address}
            placeholder={formatMessage(messages.locationPlaceholder)}
            onChange={this.handleLocationOnChange}
          />
        </FormElement>

        <FormElement id="e2e-idea-image-upload">
          <FormLabel labelMessage={messages.imageUploadLabel} />
          <label htmlFor="idea-img-dropzone">
            <HiddenLabel>
              <FormattedMessage {...messages.imageDropzonePlaceholder} />
            </HiddenLabel>
            <ImagesDropzone
              id="idea-img-dropzone"
              images={imageFile}
              imagePreviewRatio={135 / 298}
              acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
              maxImageFileSize={5000000}
              maxNumberOfImages={1}
              placeholder={<FormattedMessage {...messages.imageUploadPlaceholder} />}
              onAdd={this.handleUploadOnAdd}
              onRemove={this.handleUploadOnRemove}
            />
          </label>
        </FormElement>

        {pbContext && (
          <FeatureFlag name="participatory_budgeting">
            <HasPermission
              item="idea"
              action="assignBudget"
              context={{ projectId }}
            >
              <FormElement>
                <FormLabelWithIcon
                  labelMessage={messages.budgetLabel}
                  labelMessageValues={{ currency: tenantCurrency, maxBudget: pbContext.attributes.max_budget }}
                  htmlFor="budget"
                  iconName="admin"
                />
                <Input
                  id="budget"
                  error={budgetError}
                  value={String(budget)}
                  type="number"
                  onChange={this.handleBudgetOnChange}
                />
              </FormElement>
            </HasPermission>
          </FeatureFlag>
        )}

        <FormElement id="e2e-idea-file-upload">
          <FormLabel labelMessage={messages.fileUploadLabel} />
          <FileUploader
            onFileAdd={this.handleIdeaFileOnAdd}
            onFileRemove={this.handleIdeaFileOnRemove}
            files={ideaFiles}
          />
        </FormElement>

      </Form>
    );
  }
}

export default withRouter<Props>(injectIntl(IdeaForm));
