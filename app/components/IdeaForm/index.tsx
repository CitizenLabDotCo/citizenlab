import React, { PureComponent } from 'react';
import { Subscription, combineLatest, of, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { withRouter, WithRouterProps } from 'react-router';
import { isBoolean } from 'lodash-es';
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
import { FormSection, FormSectionTitle, FormLabel } from 'components/UI/FormComponents';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { topicsStream, ITopics, ITopicData } from 'services/topics';
import { projectByIdStream, IProjects, IProject, IProjectData } from 'services/projects';
import { phasesStream, IPhaseData, getCurrentPhase } from 'services/phases';
import {
  ideaCustomFieldsSchemasStream,
  ideaCustomFieldsStream,
  IIdeaCustomFieldsSchemas,
  IIdeaCustomFields,
  CustomFieldKeys,
} from 'services/ideaCustomFields';

// utils
import eventEmitter from 'utils/eventEmitter';
import { getLocalized } from 'utils/i18n';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { IOption, UploadFile, Locale } from 'typings';

// style
import styled from 'styled-components';
import TopicsPicker from 'components/UI/TopicsPicker';
import { FormLabelWithIcon } from 'components/UI/FormComponents/WithIcons';
import { media } from 'utils/styleUtils';

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
  locale: Locale | null;
  tenant: ITenant | null;
  topics: IOption[] | null;
  locationAllowed: boolean;
  pbContext: IProjectData | IPhaseData | null;
  projects: IOption[] | null;
  title: string;
  titleError: string | JSX.Element | null;
  description: string;
  descriptionError: string | JSX.Element | null;
  selectedTopics: string[];
  topicsError: string | JSX.Element | null;
  locationError: string | JSX.Element | null;
  imageError: string | JSX.Element | null;
  attachmentsError: string | JSX.Element | null;
  budget: number | null;
  budgetError: string | JSX.Element | null;
  address: string;
  imageFile: UploadFile[];
  ideaFiles: UploadFile[];
  ideaFilesToRemove: UploadFile[];
  ideaCustomFieldsSchemas: IIdeaCustomFieldsSchemas | null;
  ideaCustomFields: IIdeaCustomFields | null;
}

class IdeaForm extends PureComponent<Props & InjectedIntlProps & WithRouterProps, State> {
  subscriptions: Subscription[];
  titleInputElement: HTMLInputElement | null;
  descriptionElement: HTMLDivElement | null;

  constructor(props) {
    super(props);
    this.state = {
      locale: null,
      tenant: null,
      topics: null,
      pbContext: null,
      projects: null,
      locationAllowed: true,
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
      ideaFiles: [],
      ideaFilesToRemove: [],
      ideaCustomFieldsSchemas: null,
      ideaCustomFields: null,
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
    const tenant$ = currentTenantStream().observable;
    const topics$ = topicsStream().observable;
    const project$: Observable<IProject | null> = (projectId ? projectByIdStream(projectId).observable : of(null));
    const ideaCustomFieldsSchemas$ = ideaCustomFieldsSchemasStream(projectId as string).observable;
    const ideaCustomFields$ = ideaCustomFieldsStream(projectId as string).observable;
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
    const locationAllowed$ = project$.pipe(
      switchMap((project) => {
        if (project) {
          if (project.data.attributes.process_type === 'continuous' && isBoolean(project.data.attributes.location_allowed)) {
            return of(project.data.attributes.location_allowed);
          }

          if (project.data.attributes.process_type === 'timeline') {
            return phasesStream(project.data.id).observable.pipe(
              map((phases) => {
                const currentPhase = getCurrentPhase(phases.data);
                const locationAllowed = currentPhase?.attributes?.location_allowed;
                return isBoolean(locationAllowed) ? locationAllowed : true;
              })
            );
          }
        }

        return of(true);
      })
    );

    this.mapPropsToState();

    this.subscriptions = [
      combineLatest(
        locale$,
        tenant$,
        topics$,
      ).subscribe(([locale, tenant, topics]) => {
        const tenantLocales = tenant.data.attributes.settings.core.locales;

        this.setState({
          locale,
          tenant,
          topics: this.getOptions(topics, locale, tenantLocales)
        });
      }),

      pbContext$.subscribe(pbContext => this.setState({ pbContext })),

      locationAllowed$.subscribe(locationAllowed => this.setState({ locationAllowed })),

      ideaCustomFieldsSchemas$.subscribe(ideaCustomFieldsSchemas => this.setState({ ideaCustomFieldsSchemas })),
      ideaCustomFields$.subscribe(ideaCustomFields => this.setState({ ideaCustomFields })),

      eventEmitter.observeEvent('IdeaFormSubmitEvent').subscribe(this.handleOnSubmit),
    ];

    if (!bowser.mobile && this.titleInputElement !== null) {
      setTimeout(() => (this.titleInputElement as HTMLInputElement).focus(), 50);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (!shallowCompare(prevProps, this.props)) {
      this.mapPropsToState();
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  mapPropsToState = () => {
    const {
      title,
      description,
      selectedTopics,
      address,
      budget,
      imageFile,
      remoteIdeaFiles,
    } = this.props;
    const ideaFiles = Array.isArray(remoteIdeaFiles) ? remoteIdeaFiles : [];

    this.setState({
      selectedTopics,
      budget,
      imageFile,
      ideaFiles,
      address,
      title: (title || ''),
      description: (description || ''),
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

  handleUploadOnAdd = (imageFile: UploadFile[]) => {
    this.setState({
      imageFile: [imageFile[0]]
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

  handleDescriptionSetRef = (element: HTMLDivElement) => {
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
    } else if (description && description.length < 30) {
      return <FormattedMessage {...messages.descriptionLengthError} />;
    }

    return null;
  }

  validateTopics = (selectedTopics: string[]) => {
    const { ideaCustomFields } = this.state;
    const topicsRequired = this.isFieldRequired(ideaCustomFields, 'topic_ids');

    if (topicsRequired && selectedTopics.length === 0) {
      return <FormattedMessage {...messages.noTopicsError} />;
    }

    return null;
  }

  validateLocation = (address: string) => {
    const { ideaCustomFields } = this.state;
    const locationRequired = this.isFieldRequired(ideaCustomFields, 'location');

    if (locationRequired && !address) {
      return <FormattedMessage {...messages.noLocationError} />;
    }

    return null;
  }

  validateImage = (imageFiles: UploadFile[]) => {
    const { ideaCustomFields } = this.state;
    const imagesRequired = this.isFieldRequired(ideaCustomFields, 'images');

    if (imagesRequired && imageFiles.length === 0) {
      return <FormattedMessage {...messages.noImageError} />;
    }

    return null;
  }

  validateAttachments = (ideaFiles: UploadFile[]) => {
    const { ideaCustomFields } = this.state;
    const attachmentsRequired = this.isFieldRequired(ideaCustomFields, 'attachments');

    if (attachmentsRequired && ideaFiles.length === 0) {
      return <FormattedMessage {...messages.noAttachmentsError} />;
    }

    return null;
  }

  validate = (
    title: string | null,
    description: string | null,
    budget: number | null,
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

    this.setState({
      titleError,
      descriptionError,
      budgetError,
      topicsError,
      locationError,
      imageError,
      attachmentsError
    });

    if (titleError && this.titleInputElement) {
      scrollToComponent(this.titleInputElement, { align: 'top', offset: -240, duration: 300 });
      setTimeout(() => this.titleInputElement && this.titleInputElement.focus(), 300);
    } else if (descriptionError && this.descriptionElement) {
      scrollToComponent(this.descriptionElement, { align: 'top', offset: -200, duration: 300 });
      setTimeout(() => this.descriptionElement && this.descriptionElement.focus(), 300);
    }

    if (!pbContext) {
      return (!titleError && !descriptionError);
    }

    return (
      !titleError &&
      !descriptionError &&
      !budgetError &&
      !topicsError &&
      !locationError &&
      !imageError &&
      !attachmentsError
    );
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
    const {
      title,
      description,
      selectedTopics,
      address,
      budget,
      imageFile,
      ideaFiles,
      ideaFilesToRemove
    } = this.state;
    const formIsValid = this.validate(
      title,
      description,
      budget,
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
        description,
        ideaFiles,
        ideaFilesToRemove
      };

      this.props.onSubmit(output);
    }
  }

  isFieldEnabled = (
    ideaCustomFields: IIdeaCustomFields | null,
    fieldKey: CustomFieldKeys
  ) => {
    if (
      !isNilOrError(ideaCustomFields) &&
      ideaCustomFields.data.length > 0
    ) {
      const field = ideaCustomFields.data.find(field => field.attributes.key === fieldKey);

      if (field) return field.attributes.enabled;
    }

    return true;
  }

  isFieldRequired = (
    ideaCustomFields: IIdeaCustomFields | null,
    fieldKey: CustomFieldKeys
  ) => {
    if (
      !isNilOrError(ideaCustomFields) &&
      ideaCustomFields.data.length > 0
    ) {
      const field = ideaCustomFields.data.find(field => field.attributes.key === fieldKey);

      if (field) {
        return field.attributes.required;
      }
    }

    return false;
  }

  render() {
    const className = this.props['className'];
    const { projectId } = this.props;
    const { formatMessage } = this.props.intl;
    const {
      locale,
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
      ideaFiles,
      locationAllowed,
      ideaCustomFieldsSchemas,
      ideaCustomFields,
      topicsError,
      locationError,
      imageError,
      attachmentsError
    } = this.state;
    const tenantCurrency = (tenant ? tenant.data.attributes.settings.core.currency : '');

    if (!isNilOrError(ideaCustomFields)) {
      const topicsEnabled = this.isFieldEnabled(ideaCustomFields, 'topic_ids');
      const locationEnabled = this.isFieldEnabled(ideaCustomFields, 'location');
      const attachmentsEnabled = this.isFieldEnabled(ideaCustomFields, 'attachments');
      const topicsRequired = this.isFieldRequired(ideaCustomFields, 'topic_ids');
      const locationRequired = this.isFieldRequired(ideaCustomFields, 'location');
      const attachmentsRequired = this.isFieldRequired(ideaCustomFields, 'attachments');
      const imagesRequired = this.isFieldRequired(ideaCustomFields, 'images');

      return (
        <Form id="idea-form" className={className}>
          <StyledFormSection>
            <FormSectionTitle message={messages.formGeneralSectionTitle} />
            <FormElement id="e2e-idea-title-input">
              <FormLabel
                htmlFor="title"
                labelMessage={messages.title}
                optionality="required"
                subtext={ideaCustomFieldsSchemas?.json_schema_multiloc?.[locale || '']?.properties?.title?.description}
              />
              <Input
                id="title"
                type="text"
                value={title}
                placeholder={formatMessage(messages.titlePlaceholder)}
                error={titleError}
                onChange={this.handleTitleOnChange}
                setRef={this.handleTitleInputSetRef}
                maxCharCount={80}
                autocomplete="off"
              />
            </FormElement>

            <FormElement id="e2e-idea-description-input">
              <FormLabel
                id="editor-label"
                htmlFor="editor"
                labelMessage={messages.descriptionTitle}
                optionality="required"
                subtext={ideaCustomFieldsSchemas?.json_schema_multiloc?.[locale || '']?.properties?.body?.description}
              />
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
          </StyledFormSection>

          <StyledFormSection>
            <FormSectionTitle message={messages.formDetailsSectionTitle} />
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
                      iconAriaHidden
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

            {topicsEnabled && topics && topics.length > 0 && (
              <FormElement>
                <FormLabel
                  htmlFor="topics"
                  labelMessage={messages.topicsTitle}
                  optionality={topicsRequired ? 'required' : 'optional'}
                  subtext={ideaCustomFieldsSchemas?.json_schema_multiloc?.[locale || '']?.properties?.topic_ids?.description}
                />
                <TopicsPicker
                  value={selectedTopics}
                  onChange={this.handleTopicsOnChange}
                  max={2}
                />
                {topicsError && <Error text={topicsError} />}
              </FormElement>
            )}

            {(locationEnabled || locationAllowed) &&
              <FormElement>
                <FormLabel
                  labelMessage={messages.locationTitle}
                  optionality={locationRequired ? 'required' : 'optional'}
                  subtext={ideaCustomFieldsSchemas?.json_schema_multiloc?.[locale || '']?.properties?.location?.description}
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
            }
          </StyledFormSection>

          <StyledFormSection>
            <FormSectionTitle message={messages.formAttachmentsSectionTitle} />
            <FormElement id="e2e-idea-image-upload">
              <FormLabel
                htmlFor="idea-image-dropzone"
                labelMessage={messages.imageUploadTitle}
                optionality={imagesRequired ? 'required' : 'optional'}
                subtext={ideaCustomFieldsSchemas?.json_schema_multiloc?.[locale || '']?.properties?.images?.description}
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

            {attachmentsEnabled &&
              <FormElement id="e2e-idea-file-upload">
                <FormLabel
                  labelMessage={messages.attachmentsTitle}
                  optionality={attachmentsRequired ? 'required' : 'optional'}
                  subtext={ideaCustomFieldsSchemas?.json_schema_multiloc?.[locale || '']?.properties?.attachments?.description}
                >
                  <FileUploader
                    onFileAdd={this.handleIdeaFileOnAdd}
                    onFileRemove={this.handleIdeaFileOnRemove}
                    files={ideaFiles}
                  />
                </FormLabel>
                {attachmentsError && <Error text={attachmentsError} />}
              </FormElement>
            }
          </StyledFormSection>
        </Form>
      );
    }

    return null;
  }
}

export default withRouter<Props>(injectIntl(IdeaForm));

// TODO: remove locationAllowed over time. As of 17/4/2020 it's left here for backwards compatibility
// but this setting will move to the project idea form settings.
