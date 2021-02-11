import React, { PureComponent } from 'react';
import { Subscription, combineLatest, of, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { withRouter, WithRouterProps } from 'react-router';
import shallowCompare from 'utils/shallowCompare';
import { adopt } from 'react-adopt';

// libraries
import scrollToComponent from 'react-scroll-to-component';
import bowser from 'bowser';

// components
import { Input, LocationInput } from 'cl2-component-library';
import QuillEditor from 'components/UI/QuillEditor';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import Error from 'components/UI/Error';
import HasPermission from 'components/HasPermission';
import FileUploader from 'components/UI/FileUploader';
import {
  FormSection,
  FormSectionTitle,
  FormLabel,
} from 'components/UI/FormComponents';

// services
import { localeStream } from 'services/locale';
import {
  currentAppConfigurationStream,
  IAppConfiguration,
} from 'services/tenant';
import { ITopicData } from 'services/topics';
import { projectByIdStream, IProject, IProjectData } from 'services/projects';
import { phasesStream, IPhaseData } from 'services/phases';
import {
  ideaCustomFieldsSchemasStream,
  IIdeaCustomFieldsSchemas,
  CustomFieldCodes,
} from 'services/ideaCustomFields';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';

// utils
import eventEmitter from 'utils/eventEmitter';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { getInputTermMessage } from 'utils/i18n';

// typings
import { IOption, UploadFile, Locale } from 'typings';

// style
import styled from 'styled-components';
import TopicsPicker from 'components/UI/TopicsPicker';
import { FormLabelWithIcon } from 'components/UI/FormComponents/WithIcons';
import { media } from 'utils/styleUtils';
import { getInputTerm } from 'services/participationContexts';

const Form = styled.form`
  width: 100%;
  display: 'flex';
  flex-direction: column;
  align-items: center;
`;

const StyledFormSection = styled(FormSection)`
  max-width: 100%;

  ${media.smallerThanMinTablet`
    padding-left: 25px;
    padding-right: 25px;
  `}

  ${media.largePhone`
    padding-left: 18px;
    padding-right: 18px;
  `}
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

export interface IIdeaFormOutput {
  title: string;
  description: string;
  selectedTopics: string[];
  address: string;
  budget: number | null;
  proposedBudget: number | null;
  imageFile: UploadFile[];
  ideaFiles: UploadFile[];
  ideaFilesToRemove: UploadFile[];
}

interface InputProps {
  projectId: string;
  title: string | null;
  description: string | null;
  selectedTopics: string[];
  budget: number | null;
  proposedBudget: number | null;
  address: string;
  imageFile: UploadFile[];
  onSubmit: (arg: IIdeaFormOutput) => void;
  remoteIdeaFiles?: UploadFile[] | null;
}

interface DataProps {
  pbEnabled: GetFeatureFlagChildProps;
  topics: GetTopicsChildProps;
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  locale: Locale | null;
  tenant: IAppConfiguration | null;
  pbContext: IProjectData | IPhaseData | null;
  projects: IOption[] | null;
  title: string;
  titleError: string | null;
  description: string;
  descriptionError: string | null;
  selectedTopics: string[];
  topicsError: string | null;
  locationError: string | null;
  imageError: string | null;
  attachmentsError: string | null;
  budget: number | null;
  budgetError: string | null;
  proposedBudget: number | null;
  proposedBudgetError: string | null;
  address: string;
  imageFile: UploadFile[];
  ideaFiles: UploadFile[];
  ideaFilesToRemove: UploadFile[];
  ideaCustomFieldsSchemas: IIdeaCustomFieldsSchemas | null;
}

class IdeaForm extends PureComponent<
  Props & InjectedIntlProps & WithRouterProps,
  State
> {
  subscriptions: Subscription[];
  titleInputElement: HTMLInputElement | null;
  descriptionElement: HTMLDivElement | null;

  constructor(props) {
    super(props);
    this.state = {
      locale: null,
      tenant: null,
      pbContext: null,
      projects: null,
      title: '',
      titleError: null,
      description: '',
      descriptionError: null,
      selectedTopics: [],
      topicsError: null,
      address: '',
      imageFile: [],
      budget: null,
      budgetError: null,
      proposedBudget: null,
      proposedBudgetError: null,
      ideaFiles: [],
      ideaFilesToRemove: [],
      ideaCustomFieldsSchemas: null,
      locationError: null,
      imageError: null,
      attachmentsError: null,
    };
    this.subscriptions = [];
    this.titleInputElement = null;
    this.descriptionElement = null;
  }

  componentDidMount() {
    const { projectId } = this.props;
    const locale$ = localeStream().observable;
    const tenant$ = currentAppConfigurationStream().observable;
    const project$: Observable<IProject | null> = projectByIdStream(projectId)
      .observable;
    const ideaCustomFieldsSchemas$ = ideaCustomFieldsSchemasStream(
      projectId as string
    ).observable;
    const pbContext$: Observable<
      IProjectData | IPhaseData | null
    > = project$.pipe(
      switchMap((project) => {
        if (project) {
          if (project.data.attributes.participation_method === 'budgeting') {
            return of(project.data);
          }

          if (project.data.attributes.process_type === 'timeline') {
            return phasesStream(project.data.id).observable.pipe(
              map((phases) => {
                const pbPhase = phases.data.find(
                  (phase) =>
                    phase.attributes.participation_method === 'budgeting'
                );
                return pbPhase || null;
              })
            );
          }
        }

        return of(null) as Observable<any>;
      })
    );

    this.mapPropsToState();

    this.subscriptions = [
      combineLatest(locale$, tenant$).subscribe(([locale, tenant]) => {
        this.setState({
          locale,
          tenant,
        });
      }),

      pbContext$.subscribe((pbContext) => this.setState({ pbContext })),

      ideaCustomFieldsSchemas$.subscribe((ideaCustomFieldsSchemas) =>
        this.setState({ ideaCustomFieldsSchemas })
      ),

      eventEmitter
        .observeEvent('IdeaFormSubmitEvent')
        .subscribe(this.handleOnSubmit),
    ];
  }

  componentDidUpdate(prevProps: Props) {
    if (!shallowCompare(prevProps, this.props)) {
      this.mapPropsToState();
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  mapPropsToState = () => {
    const {
      title,
      description,
      selectedTopics,
      address,
      budget,
      proposedBudget,
      imageFile,
      remoteIdeaFiles,
    } = this.props;
    const ideaFiles = Array.isArray(remoteIdeaFiles) ? remoteIdeaFiles : [];

    this.setState({
      selectedTopics,
      budget,
      proposedBudget,
      imageFile,
      ideaFiles,
      address,
      title: title || '',
      description: description || '',
    });
  };

  handleTitleOnChange = (title: string) => {
    this.setState({
      title,
      titleError: null,
    });
  };

  handleDescriptionOnChange = async (description: string) => {
    const isDescriptionEmpty = !description || description === '';

    this.setState(({ descriptionError }) => ({
      description,
      descriptionError: isDescriptionEmpty ? descriptionError : null,
    }));
  };

  handleTopicsOnChange = (selectedTopics: string[]) => {
    this.setState({ selectedTopics });
  };

  handleLocationOnChange = (address: string) => {
    this.setState({ address });
  };

  handleUploadOnAdd = (imageFile: UploadFile[]) => {
    this.setState({
      imageFile: [imageFile[0]],
    });
  };

  handleUploadOnRemove = () => {
    this.setState({
      imageFile: [],
    });
  };

  handleBudgetOnChange = (budget: string) => {
    this.setState({
      budget: budget === '' ? null : Number(budget),
      budgetError: null,
    });
  };

  handleproposedBudgetOnChange = (proposedBudget: string) => {
    this.setState({
      proposedBudget: proposedBudget === '' ? null : Number(proposedBudget),
      proposedBudgetError: null,
    });
  };

  handleTitleInputSetRef = (element: HTMLInputElement) => {
    this.titleInputElement = element;
  };

  handleDescriptionSetRef = (element: HTMLDivElement) => {
    this.descriptionElement = element;
  };

  validateTitle = (title: string | null) => {
    if (!title) {
      return this.props.intl.formatMessage(messages.titleEmptyError);
    } else if (title && title.length < 10) {
      return this.props.intl.formatMessage(messages.titleLengthError);
    }

    return null;
  };

  validateDescription = (description: string | null) => {
    if (!description) {
      return this.props.intl.formatMessage(messages.descriptionEmptyError);
    } else if (description && description.length < 30) {
      return this.props.intl.formatMessage(messages.descriptionLengthError);
    }

    return null;
  };

  validateTopics = (selectedTopics: string[]) => {
    const { ideaCustomFieldsSchemas, locale } = this.state;

    if (!isNilOrError(ideaCustomFieldsSchemas) && !isNilOrError(locale)) {
      const topicsRequired = this.isFieldRequired(
        'topic_ids',
        ideaCustomFieldsSchemas,
        locale
      );

      if (topicsRequired && selectedTopics.length === 0) {
        return this.props.intl.formatMessage(messages.noTopicsError);
      }
    }

    return null;
  };

  validateLocation = (address: string) => {
    const { ideaCustomFieldsSchemas, locale } = this.state;

    if (!isNilOrError(ideaCustomFieldsSchemas) && !isNilOrError(locale)) {
      const locationRequired = this.isFieldRequired(
        'location',
        ideaCustomFieldsSchemas,
        locale
      );

      if (locationRequired && !address) {
        return this.props.intl.formatMessage(messages.noLocationError);
      }
    }

    return null;
  };

  validateImage = (imageFiles: UploadFile[]) => {
    const { ideaCustomFieldsSchemas, locale } = this.state;

    if (!isNilOrError(ideaCustomFieldsSchemas) && !isNilOrError(locale)) {
      const imagesRequired = this.isFieldRequired(
        'images',
        ideaCustomFieldsSchemas,
        locale
      );

      if (imagesRequired && imageFiles.length === 0) {
        return this.props.intl.formatMessage(messages.noImageError);
      }
    }

    return null;
  };

  validateAttachments = (ideaFiles: UploadFile[]) => {
    const { ideaCustomFieldsSchemas, locale } = this.state;

    if (!isNilOrError(ideaCustomFieldsSchemas) && !isNilOrError(locale)) {
      const attachmentsRequired = this.isFieldRequired(
        'attachments',
        ideaCustomFieldsSchemas,
        locale
      );

      if (attachmentsRequired && ideaFiles.length === 0) {
        return this.props.intl.formatMessage(messages.noAttachmentsError);
      }
    }

    return null;
  };

  validateproposedBudget = (proposedBudget: number | null) => {
    const { ideaCustomFieldsSchemas, locale } = this.state;

    if (!isNilOrError(ideaCustomFieldsSchemas) && !isNilOrError(locale)) {
      const proposedBudgetRequired = this.isFieldRequired(
        'proposed_budget',
        ideaCustomFieldsSchemas,
        locale
      );

      if (proposedBudgetRequired && proposedBudget === null) {
        return this.props.intl.formatMessage(messages.noproposedBudgetError);
      }
    }

    return null;
  };

  validate = (
    title: string | null,
    description: string | null,
    budget: number | null,
    proposedBudget: number | null,
    selectedTopics: string[],
    address: string,
    imageFiles: UploadFile[],
    ideaFiles: UploadFile[]
  ) => {
    const { pbContext } = this.state;
    const titleError = this.validateTitle(title);
    const descriptionError = this.validateDescription(description);
    const topicsError = this.validateTopics(selectedTopics);
    const locationError = this.validateLocation(address);
    const imageError = this.validateImage(imageFiles);
    const attachmentsError = this.validateAttachments(ideaFiles);
    const proposedBudgetError = this.validateproposedBudget(proposedBudget);
    const pbMaxBudget =
      pbContext && pbContext.attributes.max_budget
        ? pbContext.attributes.max_budget
        : null;
    let budgetError: string | null = null;

    if (pbContext) {
      if (
        budget === null &&
        (pbContext.type === 'project' ||
          (pbContext.type === 'phase' &&
            pastPresentOrFuture([
              (pbContext as IPhaseData).attributes.start_at,
              (pbContext as IPhaseData).attributes.end_at,
            ]) === 'present'))
      ) {
        budgetError = this.props.intl.formatMessage(messages.noBudgetError);
      } else if (budget === 0) {
        budgetError = this.props.intl.formatMessage(messages.budgetIsZeroError);
      } else if (pbMaxBudget && budget && budget > pbMaxBudget) {
        budgetError = this.props.intl.formatMessage(messages.budgetIsTooBig);
      }
    }

    this.setState({
      titleError,
      descriptionError,
      budgetError,
      proposedBudgetError,
      topicsError,
      locationError,
      imageError,
      attachmentsError,
    });

    // scroll to erroneous title/description fields
    if (titleError && this.titleInputElement) {
      scrollToComponent(this.titleInputElement, {
        align: 'top',
        offset: -240,
        duration: 300,
      });
      setTimeout(
        () => this.titleInputElement && this.titleInputElement.focus(),
        300
      );
    } else if (descriptionError && this.descriptionElement) {
      scrollToComponent(this.descriptionElement, {
        align: 'top',
        offset: -200,
        duration: 300,
      });
      setTimeout(
        () => this.descriptionElement && this.descriptionElement.focus(),
        300
      );
    }

    const hasError =
      !titleError &&
      !descriptionError &&
      !budgetError &&
      !proposedBudgetError &&
      !topicsError &&
      !locationError &&
      !imageError &&
      !attachmentsError;

    return hasError;
  };

  handleIdeaFileOnAdd = (ideaFileToAdd: UploadFile) => {
    this.setState(({ ideaFiles }) => ({
      ideaFiles: [...ideaFiles, ideaFileToAdd],
    }));
  };

  handleIdeaFileOnRemove = (ideaFileToRemove: UploadFile) => {
    this.setState(({ ideaFiles, ideaFilesToRemove }) => ({
      ideaFiles: ideaFiles.filter(
        (ideaFile) => ideaFile.base64 !== ideaFileToRemove.base64
      ),
      ideaFilesToRemove: [...ideaFilesToRemove, ideaFileToRemove],
    }));
  };

  handleOnSubmit = () => {
    const {
      title,
      description,
      selectedTopics,
      address,
      budget,
      proposedBudget,
      imageFile,
      ideaFiles,
      ideaFilesToRemove,
    } = this.state;
    const formIsValid = this.validate(
      title,
      description,
      budget,
      proposedBudget,
      selectedTopics,
      address,
      imageFile,
      ideaFiles
    );

    if (formIsValid) {
      const output: IIdeaFormOutput = {
        title,
        selectedTopics,
        address,
        imageFile,
        budget,
        proposedBudget,
        description,
        ideaFiles,
        ideaFilesToRemove,
      };

      this.props.onSubmit(output);
    }
  };

  isFieldRequired = (
    fieldCode: CustomFieldCodes,
    ideaCustomFieldsSchemas: IIdeaCustomFieldsSchemas,
    locale: Locale
  ) => {
    return ideaCustomFieldsSchemas.json_schema_multiloc[
      locale
    ].required.includes(fieldCode);
  };

  isFieldEnabled = (
    fieldCode: CustomFieldCodes,
    ideaCustomFieldsSchemas: IIdeaCustomFieldsSchemas,
    locale: Locale
  ) => {
    return (
      ideaCustomFieldsSchemas.json_schema_multiloc?.[locale]?.properties?.[
        fieldCode
      ] &&
      ideaCustomFieldsSchemas.ui_schema_multiloc?.[locale]?.[fieldCode]?.[
        'ui:widget'
      ] !== 'hidden'
    );
  };

  render() {
    const className = this.props['className'];
    const { projectId, pbEnabled, topics, project, phases } = this.props;
    const { formatMessage } = this.props.intl;
    const {
      locale,
      tenant,
      pbContext,
      title,
      description,
      selectedTopics,
      address,
      budget,
      proposedBudget,
      imageFile,
      titleError,
      descriptionError,
      budgetError,
      proposedBudgetError,
      ideaFiles,
      ideaCustomFieldsSchemas,
      topicsError,
      locationError,
      imageError,
      attachmentsError,
    } = this.state;

    const mapsLoaded = window.googleMaps;

    const tenantCurrency = tenant
      ? tenant.data.attributes.settings.core.currency
      : '';

    if (
      !isNilOrError(ideaCustomFieldsSchemas) &&
      !isNilOrError(locale) &&
      !isNilOrError(topics) &&
      !isNilOrError(project)
    ) {
      const topicsEnabled = this.isFieldEnabled(
        'topic_ids',
        ideaCustomFieldsSchemas,
        locale
      );
      const locationEnabled = this.isFieldEnabled(
        'location',
        ideaCustomFieldsSchemas,
        locale
      );
      const attachmentsEnabled = this.isFieldEnabled(
        'attachments',
        ideaCustomFieldsSchemas,
        locale
      );
      const proposedBudgetEnabled = this.isFieldEnabled(
        'proposed_budget',
        ideaCustomFieldsSchemas,
        locale
      );
      const showPBBudget = pbContext && pbEnabled;
      const showTopics = topicsEnabled && topics && topics.length > 0;
      const showLocation = locationEnabled;
      const showproposedBudget = proposedBudgetEnabled;
      const filteredTopics = topics.filter(
        (topic) => !isNilOrError(topic)
      ) as ITopicData[];
      const inputTerm = getInputTerm(
        project.attributes.process_type,
        project,
        phases
      );

      return (
        <Form id="idea-form" className={className}>
          <StyledFormSection>
            <FormSectionTitle
              message={getInputTermMessage(inputTerm, {
                idea: messages.formGeneralSectionTitle,
                option: messages.optionFormGeneralSectionTitle,
                project: messages.projectFormGeneralSectionTitle,
                question: messages.questionFormGeneralSectionTitle,
                issue: messages.issueFormGeneralSectionTitle,
                contribution: messages.contributionFormGeneralSectionTitle,
              })}
            />
            <FormElement id="e2e-idea-title-input">
              <FormLabel
                htmlFor="title"
                labelMessage={messages.title}
                optional={
                  !this.isFieldRequired(
                    'title',
                    ideaCustomFieldsSchemas,
                    locale
                  )
                }
                subtext={
                  ideaCustomFieldsSchemas?.json_schema_multiloc?.[locale || '']
                    ?.properties?.title?.description
                }
                subtextSupportsHtml={true}
              />
              <Input
                id="title"
                type="text"
                value={title}
                error={titleError}
                onChange={this.handleTitleOnChange}
                setRef={this.handleTitleInputSetRef}
                autoFocus={!bowser.mobile}
                maxCharCount={80}
                autocomplete="off"
              />
            </FormElement>

            <FormElement id="e2e-idea-description-input">
              <FormLabel
                id="editor-label"
                htmlFor="editor"
                labelMessage={messages.descriptionTitle}
                optional={
                  !this.isFieldRequired('body', ideaCustomFieldsSchemas, locale)
                }
                subtext={
                  ideaCustomFieldsSchemas?.json_schema_multiloc?.[locale || '']
                    ?.properties?.body?.description
                }
                subtextSupportsHtml={true}
              />
              <QuillEditor
                id="editor"
                value={description}
                onChange={this.handleDescriptionOnChange}
                setRef={this.handleDescriptionSetRef}
                hasError={descriptionError !== null}
                withCTAButton
              />
              {descriptionError && <Error text={descriptionError} />}
            </FormElement>
          </StyledFormSection>

          {(showPBBudget || showTopics || showLocation) && (
            <StyledFormSection>
              <FormSectionTitle message={messages.formDetailsSectionTitle} />
              {showPBBudget && (
                <HasPermission
                  item="idea"
                  action="assignBudget"
                  context={{ projectId }}
                >
                  <FormElement>
                    <FormLabelWithIcon
                      labelMessage={messages.budgetLabel}
                      labelMessageValues={{
                        currency: tenantCurrency,
                        maxBudget: pbContext?.attributes.max_budget,
                      }}
                      htmlFor="budget"
                      iconName="admin"
                      iconAriaHidden
                    />
                    <Input
                      id="budget"
                      error={budgetError}
                      value={budget !== null ? String(budget) : ''}
                      type="number"
                      onChange={this.handleBudgetOnChange}
                    />
                  </FormElement>
                </HasPermission>
              )}

              {showproposedBudget && (
                <FormElement>
                  <FormLabel
                    htmlFor="estimated-budget"
                    labelMessage={messages.proposedBudgetLabel}
                    labelMessageValues={{
                      currency: tenantCurrency,
                    }}
                    optional={
                      !this.isFieldRequired(
                        'proposed_budget',
                        ideaCustomFieldsSchemas,
                        locale
                      )
                    }
                    subtext={
                      ideaCustomFieldsSchemas?.json_schema_multiloc?.[
                        locale || ''
                      ]?.properties?.proposed_budget?.description
                    }
                    subtextSupportsHtml={true}
                  />
                  <Input
                    id="estimated-budget"
                    error={proposedBudgetError}
                    value={
                      proposedBudget !== null ? String(proposedBudget) : ''
                    }
                    type="number"
                    min="0"
                    onChange={this.handleproposedBudgetOnChange}
                  />
                </FormElement>
              )}

              {showTopics && (
                <FormElement>
                  <FormLabel
                    htmlFor="topics"
                    labelMessage={messages.topicsTitle}
                    optional={
                      !this.isFieldRequired(
                        'topic_ids',
                        ideaCustomFieldsSchemas,
                        locale
                      )
                    }
                    subtext={
                      ideaCustomFieldsSchemas?.json_schema_multiloc?.[
                        locale || ''
                      ]?.properties?.topic_ids?.description
                    }
                    subtextSupportsHtml={true}
                  />
                  <TopicsPicker
                    selectedTopicIds={selectedTopics}
                    onChange={this.handleTopicsOnChange}
                    availableTopics={filteredTopics}
                  />
                  {topicsError && (
                    <Error id="e2e-new-idea-topics-error" text={topicsError} />
                  )}
                </FormElement>
              )}

              {showLocation && mapsLoaded && (
                <FormElement>
                  <FormLabel
                    labelMessage={messages.locationTitle}
                    optional={
                      !this.isFieldRequired(
                        'location',
                        ideaCustomFieldsSchemas,
                        locale
                      )
                    }
                    subtext={
                      ideaCustomFieldsSchemas?.json_schema_multiloc?.[
                        locale || ''
                      ]?.properties?.location?.description
                    }
                    subtextSupportsHtml={true}
                  >
                    <LocationInput
                      className="e2e-idea-form-location-input-field"
                      value={address}
                      placeholder={formatMessage(messages.locationPlaceholder)}
                      onChange={this.handleLocationOnChange}
                    />
                  </FormLabel>
                  {locationError && <Error text={locationError} />}
                </FormElement>
              )}
            </StyledFormSection>
          )}

          <StyledFormSection>
            <FormSectionTitle message={messages.fileAttachmentsTitle} />
            <FormElement id="e2e-idea-image-upload">
              <FormLabel
                htmlFor="idea-image-dropzone"
                labelMessage={messages.imageUploadTitle}
                optional={
                  !this.isFieldRequired(
                    'images',
                    ideaCustomFieldsSchemas,
                    locale
                  )
                }
                subtext={
                  ideaCustomFieldsSchemas?.json_schema_multiloc?.[locale || '']
                    ?.properties?.images?.description
                }
                subtextSupportsHtml={true}
              />
              <ImagesDropzone
                id="idea-image-dropzone"
                images={imageFile}
                imagePreviewRatio={135 / 298}
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                maxImageFileSize={5000000}
                maxNumberOfImages={1}
                onAdd={this.handleUploadOnAdd}
                onRemove={this.handleUploadOnRemove}
              />
              {imageError && <Error text={imageError} />}
            </FormElement>

            {attachmentsEnabled && (
              <FormElement id="e2e-idea-file-upload">
                <FormLabel
                  labelMessage={messages.otherFilesTitle}
                  optional={
                    !this.isFieldRequired(
                      'attachments',
                      ideaCustomFieldsSchemas,
                      locale
                    )
                  }
                  subtext={
                    ideaCustomFieldsSchemas?.json_schema_multiloc?.[
                      locale || ''
                    ]?.properties?.attachments?.description
                  }
                  subtextSupportsHtml={true}
                >
                  <FileUploader
                    onFileAdd={this.handleIdeaFileOnAdd}
                    onFileRemove={this.handleIdeaFileOnRemove}
                    files={ideaFiles}
                  />
                </FormLabel>
                {attachmentsError && <Error text={attachmentsError} />}
              </FormElement>
            )}
          </StyledFormSection>
        </Form>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  pbEnabled: <GetFeatureFlag name="participatory_budgeting" />,
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  phases: ({ projectId, render }) => (
    <GetPhases projectId={projectId}>{render}</GetPhases>
  ),
  topics: ({ projectId, render }) => {
    return <GetTopics projectId={projectId}>{render}</GetTopics>;
  },
});

const IdeaFormWitHOCs = withRouter<Props>(injectIntl(IdeaForm));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaFormWitHOCs {...dataProps} {...inputProps} />}
  </Data>
);
