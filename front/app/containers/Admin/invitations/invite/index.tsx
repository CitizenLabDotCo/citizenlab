import React from 'react';
import { isString, isEmpty, get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import TextArea from 'components/UI/TextArea';
import Error from 'components/UI/Error';
import { Radio, IconTooltip, Toggle, Label } from 'cl2-component-library';
import Tabs from 'components/UI/Tabs';
import Collapse from 'components/UI/Collapse';
import MultipleSelect from 'components/UI/MultipleSelect';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionField, SectionTitle } from 'components/admin/Section';
import QuillEditor from 'components/UI/QuillEditor';
import HelmetIntl from 'components/HelmetIntl';
import Button from 'components/UI/Button';
import Warning from 'components/UI/Warning';

// services
import {
  bulkInviteXLSX,
  bulkInviteEmails,
  IInviteError,
  INewBulkInvite,
} from 'services/invites';

// resources
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import { API_PATH, appLocalePairs } from 'containers/App/constants';
import { getLocalized } from 'utils/i18n';

// utils
import { getBase64FromFile } from 'utils/fileTools';
import { saveAs } from 'file-saver';
import { requestBlob } from 'utils/request';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

// typings
import { Locale, IOption } from 'typings';

const InvitationOptions = styled.div`
  width: 497px;
  padding: 20px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px #ddd;
  background: #fff;
`;

const StyledTabs = styled(Tabs)`
  margin-bottom: 35px;
`;

const FileInputWrapper = styled.div`
  margin-top: 15px;
  margin-bottom: 20px;
`;

const StyledToggle = styled(Toggle)`
  margin-bottom: 10px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-top: 30px;
`;

const Processing = styled.div`
  color: ${(props) => props.theme.colors.label};
  margin-left: 15px;
`;

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 15px;
  font-size: ${fontSizes.large}px;
  font-weight: bold;
`;

const SectionDescription = styled.div`
  font-size: ${fontSizes.base}px;
`;

const SectionParagraph = styled.p`
  a {
    color: ${colors.clBlue};
    text-decoration: underline;

    &:hover {
      color: ${darken(0.2, colors.clBlue)};
      text-decoration: underline;
    }
  }
`;

const FlexWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DownloadButton = styled(Button)`
  margin-bottom: 15px;
`;

const StyledWarning = styled(Warning)`
  margin-top: 5px;
`;

export interface InputProps {}

interface DataProps {
  projects: GetProjectsChildProps;
  locale: GetLocaleChildProps;
  tenantLocales: GetAppConfigurationLocalesChildProps;
  groups: GetGroupsChildProps;
}

interface Props extends InputProps, DataProps {}

type State = {
  selectedEmails: string | null;
  selectedFileBase64: string | null;
  hasAdminRights: boolean;
  hasModeratorRights: boolean;
  selectedLocale: Locale | null;
  selectedProjects: IOption[] | null;
  selectedGroups: IOption[] | null;
  selectedInviteText: string | null;
  invitationOptionsOpened: boolean;
  selectedView: 'import' | 'text';
  processing: boolean;
  processed: boolean;
  apiErrors: IInviteError[] | null;
  filetypeError: JSX.Element | null;
  unknownError: JSX.Element | null;
};

class Invitations extends React.PureComponent<
  Props & InjectedIntlProps,
  State
> {
  fileInputElement: HTMLInputElement | null;

  constructor(props) {
    super(props);
    this.state = {
      selectedEmails: null,
      selectedFileBase64: null,
      hasAdminRights: false,
      hasModeratorRights: false,
      selectedLocale: null,
      selectedProjects: null,
      selectedGroups: null,
      selectedInviteText: null,
      invitationOptionsOpened: false,
      selectedView: 'import',
      processing: false,
      processed: false,
      apiErrors: null,
      filetypeError: null,
      unknownError: null,
    };
    this.fileInputElement = null;
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    if (nextProps.tenantLocales && !prevState.selectedLocale) {
      return {
        selectedLocale: nextProps.tenantLocales[0],
      };
    }

    return null;
  }

  getProjectOptions = (
    projects: GetProjectsChildProps,
    locale: GetLocaleChildProps,
    tenantLocales: GetAppConfigurationLocalesChildProps
  ) => {
    const { projectsList } = projects;

    if (
      !isNilOrError(locale) &&
      !isNilOrError(tenantLocales) &&
      !isNilOrError(projectsList) &&
      projectsList.length > 0
    ) {
      return projectsList.map((project) => ({
        value: project.id,
        label: getLocalized(
          project.attributes.title_multiloc,
          locale,
          tenantLocales
        ),
      }));
    }

    return null;
  };

  getGroupOptions = (
    groups: GetGroupsChildProps,
    locale: GetLocaleChildProps,
    tenantLocales: GetAppConfigurationLocalesChildProps
  ) => {
    if (
      !isNilOrError(locale) &&
      !isNilOrError(tenantLocales) &&
      !isNilOrError(groups.groupsList) &&
      groups.groupsList.length > 0
    ) {
      return groups.groupsList.map((group) => ({
        value: group.id,
        label: getLocalized(
          group.attributes.title_multiloc,
          locale,
          tenantLocales
        ),
      }));
    }

    return null;
  };

  resetErrorAndSuccessState() {
    this.setState({ processed: false, apiErrors: null, unknownError: null });
  }

  handleEmailListOnChange = (selectedEmails: string) => {
    this.resetErrorAndSuccessState();
    this.setState({ selectedEmails });
  };

  handleFileInputOnChange = async (event) => {
    let selectedFile: File | null =
      event.target.files && event.target.files.length === 1
        ? event.target.files['0']
        : null;
    let filetypeError: JSX.Element | null = null;

    if (
      selectedFile &&
      selectedFile.type !==
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      filetypeError = <FormattedMessage {...messages.filetypeError} />;
      selectedFile = null;

      if (this.fileInputElement) {
        this.fileInputElement.value = '';
      }
    }

    const selectedFileBase64 = selectedFile
      ? await getBase64FromFile(selectedFile)
      : null;
    this.resetErrorAndSuccessState();
    this.setState({ selectedFileBase64, filetypeError });
  };

  handleAdminRightsOnToggle = () => {
    this.resetErrorAndSuccessState();
    this.setState((state) => ({ hasAdminRights: !state.hasAdminRights }));
  };

  handleModeratorRightsOnToggle = () => {
    this.resetErrorAndSuccessState();
    this.setState((state) => ({
      hasModeratorRights: !state.hasModeratorRights,
    }));
  };

  handleLocaleOnChange = (selectedLocale: Locale) => {
    this.resetErrorAndSuccessState();
    this.setState({ selectedLocale });
  };

  handleSelectedProjectsOnChange = (selectedProjects: IOption[]) => {
    this.resetErrorAndSuccessState();
    this.setState({
      selectedProjects: selectedProjects.length > 0 ? selectedProjects : null,
    });
  };

  handleSelectedGroupsOnChange = (selectedGroups: IOption[]) => {
    this.resetErrorAndSuccessState();
    this.setState({
      selectedGroups: selectedGroups.length > 0 ? selectedGroups : null,
    });
  };

  handleInviteTextOnChange = (selectedInviteText: string) => {
    this.resetErrorAndSuccessState();
    this.setState({ selectedInviteText });
  };

  getSubmitState = (errors: IInviteError[] | null, processed: boolean) => {
    const isInvitationValid = this.validateInvitation();
    if (errors && errors.length > 0) {
      return 'error';
    } else if (processed && !isInvitationValid) {
      return 'success';
    } else if (!isInvitationValid) {
      return 'disabled';
    }
    return 'enabled';
  };

  toggleOptions = () => {
    this.setState((state) => ({
      invitationOptionsOpened: !state.invitationOptionsOpened,
    }));
  };

  resetWithView = (selectedView: 'import' | 'text') => {
    this.setState({
      selectedView,
      selectedEmails: null,
      selectedFileBase64: null,
      hasAdminRights: false,
      hasModeratorRights: false,
      selectedLocale: this.props.tenantLocales
        ? this.props.tenantLocales[0]
        : null,
      selectedProjects: null,
      selectedGroups: null,
      selectedInviteText: null,
      invitationOptionsOpened: false,
      processed: false,
      apiErrors: null,
      filetypeError: null,
      unknownError: null,
    });
  };

  downloadExampleFile = async (event) => {
    event.preventDefault();
    const blob = await requestBlob(
      `${API_PATH}/invites/example_xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    saveAs(blob, 'example.xlsx');
  };

  setFileInputRef = (ref: HTMLInputElement) => {
    this.fileInputElement = ref;
  };

  getRoles = () => {
    const { hasAdminRights, hasModeratorRights, selectedProjects } = this.state;

    const roles: INewBulkInvite['roles'] = [];

    if (hasAdminRights) {
      roles.push({ type: 'admin' });
    }

    if (hasModeratorRights && selectedProjects && selectedProjects.length > 0) {
      selectedProjects.forEach((project) => {
        roles.push({ type: 'project_moderator', project_id: project.value });
      });
    }

    return roles;
  };

  handleOnSubmit = async (event) => {
    event.preventDefault();
    const {
      selectedLocale,
      selectedView,
      selectedEmails,
      selectedFileBase64,
      selectedGroups,
      selectedInviteText,
    } = this.state;
    const hasCorrectSelection =
      (selectedView === 'import' &&
        isString(selectedFileBase64) &&
        !selectedEmails) ||
      (selectedView === 'text' &&
        !selectedFileBase64 &&
        isString(selectedEmails));

    if (selectedLocale && hasCorrectSelection) {
      try {
        this.setState({
          processing: true,
          processed: false,
          apiErrors: null,
          filetypeError: null,
          unknownError: null,
        });

        const bulkInvite: INewBulkInvite = {
          locale: selectedLocale,
          roles: this.getRoles(),
          group_ids:
            selectedGroups && selectedGroups.length > 0
              ? selectedGroups.map((group) => group.value)
              : null,
          invite_text: selectedInviteText,
        };

        if (selectedView === 'import' && isString(selectedFileBase64)) {
          await bulkInviteXLSX({
            xlsx: selectedFileBase64,
            ...bulkInvite,
          });
        }

        if (selectedView === 'text' && isString(selectedEmails)) {
          await bulkInviteEmails({
            emails: selectedEmails.split(',').map((item) => item.trim()),
            ...bulkInvite,
          });
        }

        // reset file input
        if (this.fileInputElement) {
          this.fileInputElement.value = '';
        }

        // reset state
        this.setState({
          processing: false,
          processed: true,
          selectedEmails: null,
          selectedFileBase64: null,
        });
      } catch (errors) {
        const apiErrors = get(errors, 'json.errors', null);

        this.setState({
          apiErrors,
          unknownError: !apiErrors ? (
            <FormattedMessage {...messages.unknownError} />
          ) : null,
          processing: false,
        });
      }
    }
  };

  validateInvitation = () => {
    const {
      selectedEmails,
      selectedProjects,
      hasModeratorRights,
      selectedFileBase64,
    } = this.state;
    const isValidEmails = isString(selectedEmails) && !isEmpty(selectedEmails);
    const hasValidRights = hasModeratorRights
      ? !isEmpty(selectedProjects)
      : true;
    const isValidInvitationTemplate =
      isString(selectedFileBase64) && !isEmpty(selectedFileBase64);
    return (isValidEmails || isValidInvitationTemplate) && hasValidRights;
  };

  render() {
    const {
      projects,
      locale,
      tenantLocales,
      groups,
      intl: { formatMessage },
    } = this.props;
    const {
      selectedEmails,
      hasAdminRights,
      hasModeratorRights,
      selectedLocale,
      selectedProjects,
      selectedGroups,
      selectedInviteText,
      invitationOptionsOpened,
      selectedView,
      processing,
      processed,
      apiErrors,
      filetypeError,
      unknownError,
    } = this.state;
    const projectOptions = this.getProjectOptions(
      projects,
      locale,
      tenantLocales
    );
    const groupOptions = this.getGroupOptions(groups, locale, tenantLocales);

    const invitationTabs = [
      {
        value: 'import',
        label: this.props.intl.formatMessage(messages.importTab),
      },
      {
        value: 'text',
        label: this.props.intl.formatMessage(messages.textTab),
      },
    ];

    const invitationOptions = (
      <Collapse
        opened={invitationOptionsOpened}
        onToggle={this.toggleOptions}
        label={<FormattedMessage {...messages.invitationOptions} />}
        labelTooltipText={
          selectedView === 'import' ? (
            <FormattedMessage
              {...messages.importOptionsInfo}
              values={{
                supportPageLink: (
                  // tslint:disable-next-line
                  <a
                    href={this.props.intl.formatMessage(
                      messages.invitesSupportPageURL
                    )}
                    target="_blank"
                  >
                    <FormattedMessage {...messages.supportPage} />
                  </a>
                ),
              }}
            />
          ) : null
        }
      >
        <InvitationOptions>
          <SectionField>
            <FlexWrapper>
              <Label>
                <FormattedMessage {...messages.adminLabel} />
                <IconTooltip
                  content={<FormattedMessage {...messages.adminLabelTooltip} />}
                />
              </Label>
              <Toggle
                checked={hasAdminRights}
                onChange={this.handleAdminRightsOnToggle}
              />
            </FlexWrapper>
          </SectionField>

          <SectionField>
            <FlexWrapper>
              <Label>
                <FormattedMessage {...messages.moderatorLabel} />
                <IconTooltip
                  content={
                    <FormattedMessage
                      {...messages.moderatorLabelTooltip}
                      values={{
                        moderatorLabelTooltipLink: (
                          // tslint:disable-next-line
                          <a
                            href={formatMessage(
                              messages.moderatorLabelTooltipLink
                            )}
                            target="_blank"
                          >
                            <FormattedMessage
                              {...messages.moderatorLabelTooltipLinkText}
                            />
                          </a>
                        ),
                      }}
                    />
                  }
                />
              </Label>
              <StyledToggle
                checked={hasModeratorRights}
                onChange={this.handleModeratorRightsOnToggle}
              />
            </FlexWrapper>

            {hasModeratorRights && (
              <>
                <MultipleSelect
                  value={selectedProjects}
                  options={projectOptions}
                  onChange={this.handleSelectedProjectsOnChange}
                  placeholder={
                    <FormattedMessage
                      {...messages.projectSelectorPlaceholder}
                    />
                  }
                />
                {isNilOrError(selectedProjects) && (
                  <StyledWarning>
                    <FormattedMessage {...messages.required} />
                  </StyledWarning>
                )}
              </>
            )}
          </SectionField>

          {!isNilOrError(tenantLocales) && tenantLocales.length > 1 && (
            <SectionField>
              <Label>
                <FormattedMessage {...messages.localeLabel} />
              </Label>

              {tenantLocales.map((currentTenantLocale) => (
                <Radio
                  key={currentTenantLocale}
                  onChange={this.handleLocaleOnChange}
                  currentValue={selectedLocale}
                  value={currentTenantLocale}
                  label={appLocalePairs[currentTenantLocale]}
                  name="locales"
                  id={`locale-${currentTenantLocale}`}
                />
              ))}
            </SectionField>
          )}

          <SectionField>
            <Label>
              <FormattedMessage {...messages.addToGroupLabel} />
            </Label>
            <MultipleSelect
              value={selectedGroups}
              options={groupOptions}
              onChange={this.handleSelectedGroupsOnChange}
              placeholder={<FormattedMessage {...messages.groupsPlaceholder} />}
            />
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.inviteTextLabel} />
            </Label>
            <QuillEditor
              id="invite-text"
              value={selectedInviteText || ''}
              onChange={this.handleInviteTextOnChange}
              limitedTextFormatting
              noImages
              noVideos
              withCTAButton
            />
          </SectionField>
        </InvitationOptions>
      </Collapse>
    );

    return (
      <>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <form onSubmit={this.handleOnSubmit} id="e2e-invitations">
          <Section>
            <StyledTabs
              items={invitationTabs}
              selectedValue={selectedView || 'import'}
              onClick={this.resetWithView}
            />

            {selectedView === 'import' && (
              <>
                <SectionField>
                  <StyledSectionTitle>
                    <FormattedMessage {...messages.downloadFillOutTemplate} />
                  </StyledSectionTitle>
                  <SectionDescription>
                    <FlexWrapper>
                      <DownloadButton
                        buttonStyle="secondary"
                        icon="download"
                        onClick={this.downloadExampleFile}
                      >
                        <FormattedMessage {...messages.downloadTemplate} />
                      </DownloadButton>
                    </FlexWrapper>
                    <SectionParagraph>
                      <FormattedMessage
                        {...messages.visitSupportPage}
                        values={{
                          supportPageLink: (
                            // tslint:disable-next-line
                            <a
                              href={this.props.intl.formatMessage(
                                messages.invitesSupportPageURL
                              )}
                              target="_blank"
                            >
                              <FormattedMessage
                                {...messages.supportPageLinkText}
                              />
                            </a>
                          ),
                        }}
                      />
                    </SectionParagraph>
                    <SectionParagraph>
                      <FormattedMessage {...messages.fileRequirements} />
                    </SectionParagraph>
                  </SectionDescription>

                  <StyledSectionTitle>
                    <FormattedMessage {...messages.uploadCompletedFile} />
                  </StyledSectionTitle>

                  <FileInputWrapper>
                    <input
                      type="file"
                      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={this.handleFileInputOnChange}
                      ref={this.setFileInputRef}
                    />
                  </FileInputWrapper>
                  <Error text={filetypeError} />
                </SectionField>

                <StyledSectionTitle>
                  <FormattedMessage {...messages.configureInvitations} />
                </StyledSectionTitle>
                {invitationOptions}
              </>
            )}

            {selectedView === 'text' && (
              <>
                <SectionField>
                  <Label>
                    <FormattedMessage {...messages.emailListLabel} />
                  </Label>
                  <TextArea
                    value={selectedEmails || ''}
                    onChange={this.handleEmailListOnChange}
                    id="e2e-emails"
                  />
                </SectionField>

                {invitationOptions}
              </>
            )}

            <SectionField>
              <ButtonWrapper>
                <SubmitWrapper
                  loading={processing}
                  status={this.getSubmitState(apiErrors, processed)}
                  messages={{
                    buttonSave: messages.save,
                    buttonSuccess: messages.saveSuccess,
                    messageError: messages.saveErrorMessage,
                    messageSuccess: messages.saveSuccessMessage,
                  }}
                />

                {processing && (
                  <Processing>
                    <FormattedMessage {...messages.processing} />
                  </Processing>
                )}
              </ButtonWrapper>

              <Error
                apiErrors={apiErrors}
                showIcon={true}
                marginTop="15px"
                animate={false}
              />

              <Error text={unknownError} />
            </SectionField>
          </Section>
        </form>
      </>
    );
  }
}

const InvitationsWithIntl = injectIntl(Invitations);

const Data = adopt<DataProps, {}>({
  projects: (
    <GetProjects publicationStatuses={['draft', 'published', 'archived']} />
  ),
  locale: <GetLocale />,
  tenantLocales: <GetAppConfigurationLocales />,
  groups: <GetGroups membershipType="manual" />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <InvitationsWithIntl {...inputProps} {...dataProps} />}
  </Data>
);
