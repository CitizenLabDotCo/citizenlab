import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import shallowCompare from 'utils/shallowCompare';

// libraries
import bowser from 'bowser';
import scrollToComponent from 'react-scroll-to-component';

// components
import {
  Box,
  IconTooltip,
  Input,
  LocationInput,
} from '@citizenlab/cl2-component-library';
import HasPermission from 'components/HasPermission';
import Error from 'components/UI/Error';
import FileUploader from 'components/UI/FileUploader';
import {
  FormLabel,
  FormSection,
  FormSectionTitle,
} from 'components/UI/FormComponents';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import QuillEditor from 'components/UI/QuillEditor';
import UserSelect from 'components/UI/UserSelect';
import Link from 'utils/cl-router/Link';

// services
import {
  currentAppConfigurationStream,
  IAppConfiguration,
} from 'services/appConfiguration';
import {
  CustomFieldCodes,
  ideaFormSchemaStream,
  IIdeaFormSchemas,
} from 'services/ideaCustomFieldsSchemas';
import {
  ideaJsonFormsSchemaStream,
  IIdeaJsonFormSchemas,
} from 'services/ideaJsonFormsSchema';
import { getTopicIds } from 'services/projectAllowedInputTopics';
import { IProject, IProjectData, projectByIdStream } from 'services/projects';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetProjectAllowedInputTopics from 'resources/GetProjectAllowedInputTopics';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';
import { isFieldEnabled } from 'utils/projectUtils';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { getInputTermMessage } from 'utils/i18n';
import messages from './messages';

// typings
import { IOption, Locale, UploadFile } from 'typings';

// style
import TopicsPicker from 'components/UI/TopicsPicker';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { getInputTerm } from 'services/participationContexts';
import { isAdmin } from 'services/permissions/roles';
import { IUserData } from 'services/users';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Form = styled.form`
  width: 100%;
  display: 'flex';
  flex-direction: column;
  align-items: center;
`;

const StyledFormSection = styled(FormSection)`
  max-width: 100%;

  ${media.phone`
    padding-left: 25px;
    padding-right: 25px;
  `}

  ${media.phone`
    padding-left: 18px;
    padding-right: 18px;
  `}
`;

export const FormElement = styled.div`
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
  authorId: string | null;
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
  ideaFiles: UploadFile[];
  onSubmit: (arg: IIdeaFormOutput) => void;
  remoteIdeaFiles?: UploadFile[] | null;
  hasTitleProfanityError: boolean;
  hasDescriptionProfanityError: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onImageFileAdd: (imageFile: UploadFile[]) => void;
  onImageFileRemove: () => void;
  onTagsChange: (selectedTopics: string[]) => void;
  onAddressChange: (address: string) => void;
  onIdeaFilesChange: (ideaFiles: UploadFile[]) => void;
  authorId: string | null;
  ideaId?: string;
  phaseId?: string;
}

interface DataProps {
  pbEnabled: GetFeatureFlagChildProps;
  ideaAuthorChangeEnabled: GetFeatureFlagChildProps;
  isIdeaCustomFieldsEnabled: GetFeatureFlagChildProps;
  isDynamicIdeaFormEnabled: GetFeatureFlagChildProps;
  allowedTopics: GetTopicsChildProps;
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
  authUser: GetAuthUserChildProps;
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
  ideaFilesChanged: boolean;
  ideaCustomFieldsSchemas: IIdeaFormSchemas | IIdeaJsonFormSchemas | null;
  authorId: string | null;
}

class IdeaForm extends PureComponent<
  Props & WrappedComponentProps & WithRouterProps,
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
      ideaFilesChanged: false,
      ideaCustomFieldsSchemas: null,
      locationError: null,
      imageError: null,
      attachmentsError: null,
      authorId: null,
    };
    this.subscriptions = [];
    this.titleInputElement = null;
    this.descriptionElement = null;
  }

  componentDidMount() {
    const {
      projectId,
      ideaId,
      phaseId,
      isIdeaCustomFieldsEnabled,
      isDynamicIdeaFormEnabled,
    } = this.props;
    const locale$ = localeStream().observable;
    const tenant$ = currentAppConfigurationStream().observable;
    const project$: Observable<IProject | null> =
      projectByIdStream(projectId).observable;

    let ideaCustomFieldsSchemas$: Observable<
      IIdeaFormSchemas | IIdeaJsonFormSchemas | Error | null
    > = of(null);

    if (isIdeaCustomFieldsEnabled && isDynamicIdeaFormEnabled) {
      ideaCustomFieldsSchemas$ = ideaJsonFormsSchemaStream(
        projectId as string,
        phaseId,
        ideaId
      ).observable;
    } else {
      ideaCustomFieldsSchemas$ = ideaFormSchemaStream(
        projectId,
        phaseId,
        ideaId
      ).observable;
    }

    const pbContext$: Observable<IProjectData | IPhaseData | null> =
      project$.pipe(
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
      combineLatest([locale$, tenant$]).subscribe(([locale, tenant]) => {
        this.setState({
          locale,
          tenant,
        });
      }),

      pbContext$.subscribe((pbContext) => this.setState({ pbContext })),

      ideaCustomFieldsSchemas$.subscribe((ideaCustomFieldsSchemas) => {
        if (!isNilOrError(ideaCustomFieldsSchemas)) {
          this.setState({ ideaCustomFieldsSchemas });
        }
      }),

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
      authUser,
      authorId,
      ideaFiles: newIdeaFiles,
    } = this.props;

    const ideaFiles = this.state.ideaFilesChanged
      ? newIdeaFiles
      : Array.isArray(remoteIdeaFiles)
      ? remoteIdeaFiles
      : [];

    this.setState({
      selectedTopics,
      budget,
      proposedBudget,
      imageFile,
      ideaFiles,
      address,
      authorId: authorId || authUser?.id || null,
      title: title || '',
      description: description || '',
    });
  };

  handleTitleOnChange = (title: string) => {
    this.setState({
      title,
      titleError: null,
    });

    this.props.onTitleChange(title);
  };

  handleDescriptionOnChange = async (description: string) => {
    const isDescriptionEmpty = !description || description === '';

    this.setState(({ descriptionError }) => ({
      description,
      descriptionError: isDescriptionEmpty ? descriptionError : null,
    }));

    this.props.onDescriptionChange(description);
  };

  handleTopicsOnChange = (selectedTopics: string[]) => {
    this.setState({ selectedTopics });
    this.props.onTagsChange(selectedTopics);
  };

  handleLocationOnChange = (address: string) => {
    this.setState({ address });
    this.props.onAddressChange(address);
  };

  handleUploadOnAdd = (imageFile: UploadFile[]) => {
    this.setState({
      imageFile: [imageFile[0]],
    });
    this.props.onImageFileAdd(imageFile);
  };

  handleUploadOnRemove = () => {
    this.setState({
      imageFile: [],
    });
    this.props.onImageFileRemove();
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
        'location_description',
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
        'idea_images_attributes',
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
        'idea_files_attributes',
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
    const ideaFiles = [...this.state.ideaFiles, ideaFileToAdd];
    this.setState({ ideaFiles, ideaFilesChanged: true });
    this.props.onIdeaFilesChange(ideaFiles);
  };

  handleIdeaFileOnRemove = (ideaFileToRemove: UploadFile) => {
    const ideaFiles = this.state.ideaFiles.filter(
      (ideaFile) => ideaFile.base64 !== ideaFileToRemove.base64
    );

    this.setState(({ ideaFilesToRemove }) => {
      return {
        ideaFiles,
        ideaFilesToRemove: [...ideaFilesToRemove, ideaFileToRemove],
        ideaFilesChanged: true,
      };
    });

    this.props.onIdeaFilesChange(ideaFiles);
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
      authorId,
    } = this.state;
    const formClientSideIsValid = this.validate(
      title,
      description,
      budget,
      proposedBudget,
      selectedTopics,
      address,
      imageFile,
      ideaFiles
    );
    if (formClientSideIsValid) {
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
        authorId,
      };
      this.props.onSubmit(output);
    }
  };

  isFieldRequired = (
    fieldCode: CustomFieldCodes,
    ideaCustomFieldsSchemas: IIdeaFormSchemas | IIdeaJsonFormSchemas,
    locale: Locale
  ) => {
    return (
      ideaCustomFieldsSchemas.json_schema_multiloc[locale]?.required?.includes(
        fieldCode
      ) || false
    );
  };

  handleAuthorChange = (authorId?: string) => {
    this.setState({ authorId: authorId ? authorId : null });
  };

  render() {
    const className = this.props['className'];
    const {
      projectId,
      pbEnabled,
      allowedTopics,
      project,
      phases,
      hasTitleProfanityError,
      hasDescriptionProfanityError,
      authUser,
      ideaAuthorChangeEnabled,
    } = this.props;
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
      !isNilOrError(allowedTopics) &&
      !isNilOrError(project)
    ) {
      const topicsEnabled = isFieldEnabled(
        'topic_ids',
        ideaCustomFieldsSchemas,
        locale
      );
      const locationEnabled = isFieldEnabled(
        'location_description',
        ideaCustomFieldsSchemas,
        locale
      );
      const attachmentsEnabled = isFieldEnabled(
        'idea_files_attributes',
        ideaCustomFieldsSchemas,
        locale
      );
      const proposedBudgetEnabled = isFieldEnabled(
        'proposed_budget',
        ideaCustomFieldsSchemas,
        locale
      );
      const showPBBudget = pbContext && pbEnabled;
      const showTopics =
        topicsEnabled && allowedTopics && allowedTopics.length > 0;
      const showLocation = locationEnabled;
      const showProposedBudget = proposedBudgetEnabled;
      const inputTerm = getInputTerm(
        project.attributes.process_type,
        project,
        phases
      );

      const AdminBudgetFieldLabel = () => {
        return (
          <Box display="flex">
            <FormattedMessage
              {...messages.budgetLabel}
              values={{
                currency: tenantCurrency,
                maxBudget: pbContext?.attributes.max_budget,
              }}
            />
            <IconTooltip
              iconColor="black"
              marginLeft="4px"
              icon="shield-checkered"
              content={<FormattedMessage {...messages.adminFieldTooltip} />}
            />
          </Box>
        );
      };

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
                    'title_multiloc',
                    ideaCustomFieldsSchemas,
                    locale
                  )
                }
                subtextValue={
                  ideaCustomFieldsSchemas?.json_schema_multiloc?.[locale || '']
                    ?.properties?.title_multiloc?.description
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
              {hasTitleProfanityError && (
                <Error
                  text={
                    <FormattedMessage
                      {...messages.profanityError}
                      values={{
                        guidelinesLink: (
                          <Link to="/pages/faq" target="_blank">
                            {formatMessage(messages.guidelinesLinkText)}
                          </Link>
                        ),
                      }}
                    />
                  }
                />
              )}
            </FormElement>
            {ideaAuthorChangeEnabled &&
              isAdmin({ data: authUser as IUserData }) && (
                <FormElement id="e2e-idea-author-input">
                  <FormLabel
                    htmlFor="author-select"
                    labelMessage={messages.author}
                  />
                  <UserSelect
                    id="author"
                    inputId="author-select"
                    value={this.state.authorId}
                    onChange={this.handleAuthorChange}
                    placeholder={formatMessage(messages.authorPlaceholder)}
                  />
                </FormElement>
              )}

            <FormElement id="e2e-idea-description-input">
              <FormLabel
                id="editor-label"
                htmlFor="editor"
                labelMessage={messages.descriptionTitle}
                optional={
                  !this.isFieldRequired(
                    'body_multiloc',
                    ideaCustomFieldsSchemas,
                    locale
                  )
                }
                subtextValue={
                  ideaCustomFieldsSchemas?.json_schema_multiloc?.[locale || '']
                    ?.properties?.body_multiloc?.description
                }
                subtextSupportsHtml={true}
              />
              <QuillEditor
                id="editor"
                value={description}
                onChange={this.handleDescriptionOnChange}
                setRef={this.handleDescriptionSetRef}
                hasError={!!descriptionError || hasDescriptionProfanityError}
                withCTAButton
              />
              {descriptionError && <Error text={descriptionError} />}
              {hasDescriptionProfanityError && (
                <Error
                  text={
                    <FormattedMessage
                      {...messages.profanityError}
                      values={{
                        guidelinesLink: (
                          <Link to="/pages/faq" target="_blank">
                            {formatMessage(messages.guidelinesLinkText)}
                          </Link>
                        ),
                      }}
                    />
                  }
                />
              )}
            </FormElement>
          </StyledFormSection>

          {(showPBBudget ||
            showTopics ||
            showLocation ||
            showProposedBudget) && (
            <StyledFormSection>
              <FormSectionTitle message={messages.formDetailsSectionTitle} />
              {showPBBudget && (
                <HasPermission
                  item="idea"
                  action="assignBudget"
                  context={{ projectId }}
                >
                  <FormElement>
                    <Box display="flex">
                      <FormLabel
                        width="auto"
                        labelValue={<AdminBudgetFieldLabel />}
                        htmlFor="budget"
                      />
                    </Box>
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

              {showProposedBudget && (
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
                    subtextValue={
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
                <FormElement id="e2e-idea-topics-input">
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
                    subtextValue={
                      ideaCustomFieldsSchemas?.json_schema_multiloc?.[
                        locale || ''
                      ]?.properties?.topic_ids?.description
                    }
                    subtextSupportsHtml={true}
                  />
                  <TopicsPicker
                    selectedTopicIds={selectedTopics}
                    onChange={this.handleTopicsOnChange}
                    availableTopics={allowedTopics}
                  />
                  {topicsError && (
                    <Error className="e2e-error-message" text={topicsError} />
                  )}
                </FormElement>
              )}

              {showLocation && mapsLoaded && (
                <FormElement>
                  <FormLabel
                    labelMessage={messages.locationTitle}
                    optional={
                      !this.isFieldRequired(
                        'location_description',
                        ideaCustomFieldsSchemas,
                        locale
                      )
                    }
                    subtextValue={
                      ideaCustomFieldsSchemas?.json_schema_multiloc?.[
                        locale || ''
                      ]?.properties?.location_description?.description
                    }
                    subtextSupportsHtml={true}
                    htmlFor="idea-form-location-input-field"
                  >
                    <LocationInput
                      id="idea-form-location-input-field"
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
                    'idea_images_attributes',
                    ideaCustomFieldsSchemas,
                    locale
                  )
                }
                subtextValue={
                  ideaCustomFieldsSchemas?.json_schema_multiloc?.[locale || '']
                    ?.properties?.idea_images_attributes?.description
                }
                subtextSupportsHtml={true}
              />
              <ImagesDropzone
                id="idea-image-dropzone"
                images={imageFile}
                imagePreviewRatio={135 / 298}
                acceptedFileTypes={{
                  'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
                }}
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
                      'idea_files_attributes',
                      ideaCustomFieldsSchemas,
                      locale
                    )
                  }
                  subtextValue={
                    ideaCustomFieldsSchemas?.json_schema_multiloc?.[
                      locale || ''
                    ]?.properties?.idea_files_attributes?.description
                  }
                  subtextSupportsHtml={true}
                  htmlFor="idea-form-file-uploader"
                >
                  <FileUploader
                    id="idea-form-file-uploader"
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
  ideaAuthorChangeEnabled: <GetFeatureFlag name="idea_author_change" />,
  isIdeaCustomFieldsEnabled: <GetFeatureFlag name="idea_custom_fields" />,
  isDynamicIdeaFormEnabled: <GetFeatureFlag name="dynamic_idea_form" />,
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  phases: ({ projectId, render }) => (
    <GetPhases projectId={projectId}>{render}</GetPhases>
  ),
  allowedTopics: ({ projectId, render }) => {
    return (
      <GetProjectAllowedInputTopics projectId={projectId}>
        {(projectAllowedInputTopics) => {
          const topicIds = getTopicIds(projectAllowedInputTopics);

          return <GetTopics topicIds={topicIds}>{render}</GetTopics>;
        }}
      </GetProjectAllowedInputTopics>
    );
  },
  authUser: ({ render }) => {
    return <GetAuthUser>{render}</GetAuthUser>;
  },
});

const IdeaFormWitHOCs = injectIntl(withRouter(IdeaForm));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaFormWitHOCs {...dataProps} {...inputProps} />}
  </Data>
);
